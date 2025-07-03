// src/components/PayPalWebView.js - Versión mejorada para detectar pagos
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Ionicons';

const PayPalWebView = ({ route, navigation }) => {
  const { paypalUrl, orderId, onPaymentSuccess, onPaymentCancel } = route.params;
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Detectar cuando el pago se completa o cancela
  const handleNavigationStateChange = (navState) => {
    const { url } = navState;
    setCurrentUrl(url);

    console.log('🌐 WebView URL changed:', url);

    // Evitar procesar múltiples veces
    if (isProcessingPayment) {
      console.log('⚠️ Already processing payment, ignoring URL change');
      return;
    }

    // Patrones de URLs que indican pago exitoso
    const successPatterns = [
      '/webapps/hermes/api/onetouch',
      '/checkoutnow/success',
      '/checkoutnow/approved',
      '/webapps/hermes/app.html?flow=1-P', // Después del login
      'success=true',
      'PayerID=', // Cuando PayPal retorna con PayerID
    ];

    // Patrones de URLs que indican cancelación
    const cancelPatterns = [
      'cancel=true',
      '/checkoutnow/cancel',
      '/checkoutnow/error',
      'cancelled=true',
    ];

    // Detectar URLs de éxito
    const isSuccess = successPatterns.some(pattern => url.includes(pattern));
    const isCancel = cancelPatterns.some(pattern => url.includes(pattern));

    // Detectar específicamente cuando el usuario completa el login y autoriza el pago
    const isPaymentAuthorized = url.includes('/webapps/hermes') &&
                               (url.includes('useraction=CONTINUE') || url.includes('PayerID='));

    if (isSuccess || isPaymentAuthorized) {
      console.log('✅ Payment success or authorization detected');
      setIsProcessingPayment(true);

      // Mostrar mensaje de confirmación antes de regresar
      Alert.alert(
        '¡Pago Procesado! 🎉',
        'Tu pago ha sido procesado en PayPal. Ahora confirmaremos la transacción.',
        [
          {
            text: 'Confirmar',
            onPress: () => {
              navigation.goBack();
              onPaymentSuccess && onPaymentSuccess(orderId);
            }
          }
        ]
      );
    } else if (isCancel) {
      console.log('❌ Payment cancelled detected');
      setIsProcessingPayment(true);
      navigation.goBack();
      onPaymentCancel && onPaymentCancel();
    }
  };

  // Inyectar JavaScript para detectar cuando el usuario hace clic en "Pagar"
  const injectedJavaScript = `
    (function() {
      console.log('PayPal WebView JavaScript injected');

      // Detectar clics en botones de pago
      document.addEventListener('click', function(e) {
        const target = e.target;
        const buttonText = target.textContent || target.innerText || '';

        console.log('Button clicked:', buttonText);

        // Detectar botones de pago comunes
        if (buttonText.includes('Pay Now') ||
            buttonText.includes('Pagar ahora') ||
            buttonText.includes('Continue') ||
            buttonText.includes('Continuar') ||
            target.id.includes('payment') ||
            target.className.includes('payment')) {

          console.log('Payment button detected, waiting for redirect...');

          // Esperar un poco y luego notificar que el pago está en progreso
          setTimeout(function() {
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'PAYMENT_PROCESSING',
              message: 'Payment is being processed'
            }));
          }, 2000);
        }
      });

      // Detectar cambios en la URL desde JavaScript
      let currentUrl = window.location.href;
      setInterval(function() {
        if (window.location.href !== currentUrl) {
          currentUrl = window.location.href;
          console.log('URL changed via JavaScript:', currentUrl);

          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'URL_CHANGE',
              url: currentUrl
            }));
          }
        }
      }, 1000);

      true; // Required for injectedJavaScript
    })();
  `;

  // Manejar mensajes desde el JavaScript inyectado
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('📨 Message from WebView:', data);

      if (data.type === 'PAYMENT_PROCESSING') {
        console.log('💳 Payment is being processed...');
        setIsProcessingPayment(true);
      } else if (data.type === 'URL_CHANGE') {
        console.log('🔄 URL changed via JS:', data.url);
        // Procesar cambio de URL detectado por JavaScript
        handleNavigationStateChange({ url: data.url });
      }
    } catch (error) {
      console.log('Error parsing WebView message:', error);
    }
  };

  const handleWebViewError = (error) => {
    console.error('WebView error:', error);
    Alert.alert(
      'Error de Conexión',
      'Hubo un problema cargando PayPal. ¿Quieres intentar de nuevo?',
      [
        {
          text: 'Cancelar',
          onPress: () => navigation.goBack(),
          style: 'cancel'
        },
        {
          text: 'Reintentar',
          onPress: () => {
            setLoading(true);
            setIsProcessingPayment(false);
          }
        }
      ]
    );
  };

  const handleGoBack = () => {
    if (isProcessingPayment) {
      Alert.alert(
        'Pago en Proceso',
        'Tu pago se está procesando. ¿Estás seguro de que quieres cancelar?',
        [
          { text: 'Esperar', style: 'cancel' },
          {
            text: 'Cancelar',
            onPress: () => {
              navigation.goBack();
              onPaymentCancel && onPaymentCancel();
            },
            style: 'destructive'
          }
        ]
      );
    } else {
      Alert.alert(
        'Cancelar Pago',
        '¿Estás seguro de que quieres cancelar el pago?',
        [
          { text: 'Continuar Pagando', style: 'cancel' },
          {
            text: 'Cancelar Pago',
            onPress: () => {
              navigation.goBack();
              onPaymentCancel && onPaymentCancel();
            },
            style: 'destructive'
          }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#0070ba" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isProcessingPayment ? 'Procesando Pago...' : 'Pago PayPal'}
        </Text>
        <TouchableOpacity onPress={handleGoBack} style={styles.closeButton}>
          <Icon name="close" size={24} color="#0070ba" />
        </TouchableOpacity>
      </View>

      {/* URL indicator */}
      <View style={styles.urlBar}>
        <Icon name={isProcessingPayment ? "checkmark-circle" : "lock-closed"}
              size={16}
              color={isProcessingPayment ? "#28a745" : "#666"} />
        <Text style={[styles.urlText, isProcessingPayment && styles.urlTextSuccess]} numberOfLines={1}>
          {isProcessingPayment ? 'Pago procesado exitosamente' : (currentUrl || paypalUrl)}
        </Text>
      </View>

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0070ba" />
          <Text style={styles.loadingText}>Cargando PayPal...</Text>
        </View>
      )}

      {/* Processing indicator */}
      {isProcessingPayment && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#28a745" />
          <Text style={styles.processingText}>
            Procesando tu pago...
          </Text>
          <Text style={styles.processingSubtext}>
            No cierres esta pantalla
          </Text>
        </View>
      )}

      {/* WebView */}
      <WebView
        source={{ uri: paypalUrl }}
        style={[styles.webview, isProcessingPayment && styles.webviewProcessing]}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        onError={handleWebViewError}
        onHttpError={handleWebViewError}
        injectedJavaScript={injectedJavaScript}
        userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsBackForwardNavigationGestures={false}
        mixedContentMode="compatibility"
        thirdPartyCookiesEnabled={true}
      />

      {/* Bottom instruction */}
      <View style={styles.bottomBar}>
        <Text style={styles.instructionText}>
          {isProcessingPayment
            ? '🎉 ¡Pago completado! Confirmando transacción...'
            : '💳 Inicia sesión en PayPal y completa tu pago de forma segura'
          }
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0070ba',
  },
  urlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f3f4',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  urlText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  urlTextSuccess: {
    color: '#28a745',
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#0070ba',
  },
  processingContainer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
    backgroundColor: 'rgba(40, 167, 69, 0.95)',
    paddingVertical: 30,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  processingText: {
    marginTop: 12,
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  processingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  webview: {
    flex: 1,
  },
  webviewProcessing: {
    opacity: 0.5,
  },
  bottomBar: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default PayPalWebView;