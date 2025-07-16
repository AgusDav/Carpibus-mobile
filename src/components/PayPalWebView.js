// src/components/PayPalWebView.js - Versión mejorada para URLs oficiales de PayPal
import React, { useState, useRef, useEffect } from 'react';
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
  const { paypalUrl, orderId, orderData, onPaymentSuccess, onPaymentCancel } = route.params;
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const webViewRef = useRef(null);
  const processedUrls = useRef(new Set());

  // ✅ Log información de debugging al cargar
  useEffect(() => {
    console.log('🔍 PayPalWebView iniciado con:');
    console.log('- URL:', paypalUrl);
    console.log('- Order ID:', orderId);
    console.log('- Order Data:', orderData);

    // Validar que tenemos URL válida
    if (!paypalUrl) {
      console.error('❌ URL de PayPal no proporcionada');
      Alert.alert(
        'Error de Configuración',
        'No se pudo obtener la URL de PayPal. Contacta soporte.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, []);

  // Timeout para detectar pagos que no redirigen
  useEffect(() => {
    let urlCheckTimer;

    if (currentUrl && currentUrl.includes('paypal.com') && !isProcessingPayment) {
      // Timeout para detectar pagos que no redirigen - DESHABILITADO para evitar falsos positivos
      // Solo dejar que funcione la detección por URL que es más confiable
      /*
      urlCheckTimer = setInterval(() => {
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            // JavaScript de verificación deshabilitado temporalmente
            // para evitar falsos positivos en páginas intermedias
            true;
          `);
        }
      }, 5000); // Aumentado a 5 segundos para reducir frecuencia
      */
    }

    return () => {
      if (urlCheckTimer) clearInterval(urlCheckTimer);
    };
  }, [currentUrl, isProcessingPayment]);

  // ✅ CORREGIDO: Detectar SOLO cuando el pago se completa realmente
  const handleNavigationStateChange = (navState) => {
    const { url } = navState;
    setCurrentUrl(url);

    console.log('🌐 WebView URL changed:', url);

    if (processedUrls.current.has(url) || isProcessingPayment) {
      console.log('⚠️ URL ya procesada o pago en progreso, ignorando');
      return;
    }

    // ✅ DETECTAR URLs que REALMENTE indican pago completado
    const successPatterns = [
      // URLs oficiales de finalización de PayPal
      '/webapps/hermes/api/executeagreement',
      '/checkoutnow/success',
      '/checkoutnow/approved',

      // ✅ CRÍTICO: URLs de tu aplicación que indican éxito
      '/payment-success', // Esta es la que aparece en los logs
      'example.com/payment-success', // URL completa que aparece
    ];

    // Patrones de cancelación
    const cancelPatterns = [
      '/checkoutnow/cancel',
      '/checkoutnow/error',
      'cancel=true',
      'cancelled=true',
      'payment_cancelled',
      'user_cancelled',
      'error=true',
      '/payment-cancel',
      'example.com/payment-cancel'
    ];

    // ✅ DETECTAR PayerID en URLs de éxito (más confiable)
    const hasCompleteSuccess = url.includes('PayerID=') &&
                              url.includes('token=') &&
                              (url.includes('/payment-success') ||
                               url.includes('/success') ||
                               url.includes('/approved') ||
                               url.includes('example.com/payment-success'));

    const isCancel = cancelPatterns.some(pattern => url.includes(pattern));
    const isSuccess = successPatterns.some(pattern => url.includes(pattern)) || hasCompleteSuccess;

    // ✅ NO detectar en URLs intermedias (pero SÍ en las de éxito)
    const isIntermediateUrl = url.includes('/webapps/hermes/app.html') ||
                             url.includes('/signin') ||
                             url.includes('/login') ||
                             url.includes('/auth') ||
                             (url.includes('paypal.com') && !isSuccess && !isCancel);

    if (isIntermediateUrl) {
      console.log('⏳ Intermediate PayPal page detected, waiting for completion:', url);
      return; // No hacer nada, seguir esperando
    }

    if (isSuccess) {
      console.log('✅ REAL payment success detected:', {
        url,
        hasCompleteSuccess,
        hasPayerID: url.includes('PayerID='),
        matchedPattern: successPatterns.find(pattern => url.includes(pattern))
      });

      processedUrls.current.add(url);
      setIsProcessingPayment(true);

      setTimeout(() => {
        Alert.alert(
          '✅ Pago Completado',
          'Tu pago ha sido procesado exitosamente en PayPal. Ahora confirmaremos la transacción.',
          [
            {
              text: 'Confirmar Transacción',
              onPress: () => {
                navigation.goBack();
                onPaymentSuccess && onPaymentSuccess(orderId);
              }
            }
          ]
        );
      }, 500);

    } else if (isCancel) {
      console.log('❌ Payment cancelled detected:', {
        url,
        matchedPattern: cancelPatterns.find(pattern => url.includes(pattern))
      });

      processedUrls.current.add(url);
      setIsProcessingPayment(true);

      setTimeout(() => {
        navigation.goBack();
        onPaymentCancel && onPaymentCancel();
      }, 1000);
    }
  };

  // ✅ JavaScript inyectado SIMPLIFICADO - Solo para logging, no para detección automática
  const injectedJavaScript = `
    (function() {
      console.log('PayPal WebView JavaScript injected for URL: ' + window.location.href);

      let lastUrl = window.location.href;
      let logCount = 0;

      // ✅ Función SOLO para logging, NO para detección automática
      function logPaymentStatus() {
        try {
          logCount++;
          const currentUrl = window.location.href;
          const bodyText = document.body.innerText;

          // Log cada 10 segundos para debugging
          if (logCount % 5 === 0) {
            console.log('PayPal Check #' + logCount);
            console.log('Current URL:', currentUrl);
            console.log('Page title:', document.title);
            console.log('Body preview:', bodyText.substring(0, 200));
          }

          // ✅ Solo detectar cambios de URL para logging
          if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            console.log('🔄 URL changed in JavaScript:', currentUrl);

            // Solo notificar cambio de URL, NO procesamiento automático
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'URL_CHANGE_LOG',
              url: currentUrl,
              title: document.title,
              timestamp: Date.now()
            }));
          }

          // ✅ DETECTAR solo elementos muy específicos de finalización
          const hasReturnButton = document.querySelector('button[data-testid*="return"]') ||
                                 document.querySelector('a[href*="return"]') ||
                                 document.querySelector('button:contains("Return to")') ||
                                 document.querySelector('a:contains("Return to")');

          if (hasReturnButton && bodyText.toLowerCase().includes('complete')) {
            console.log('🎯 Return button with completion context found');
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'RETURN_BUTTON_FOUND',
              url: currentUrl,
              buttonText: hasReturnButton.textContent || hasReturnButton.innerText,
              timestamp: Date.now()
            }));
          }

        } catch (error) {
          console.log('Error in logging function:', error);
        }
      }

      // ✅ Ejecutar cada 2 segundos para logging
      const logInterval = setInterval(logPaymentStatus, 2000);

      // ✅ Verificación inicial
      setTimeout(logPaymentStatus, 1000);

      // ✅ Limpiar cuando se salga
      window.addEventListener('beforeunload', function() {
        clearInterval(logInterval);
      });

      true;
    })();
  `;

  // ✅ SIMPLIFICADO: Manejar mensajes desde el JavaScript inyectado
  const handleMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('📨 Message from WebView:', message);

      switch (message.type) {
        case 'URL_CHANGE_LOG':
          // Solo logging, no acción automática
          console.log('📍 URL change logged:', message.url);
          console.log('📍 Page title:', message.title);
          break;

        case 'RETURN_BUTTON_FOUND':
          console.log('🔘 Return button found with completion context');
          console.log('Button text:', message.buttonText);
          // NO procesar automáticamente, solo logear
          break;

        default:
          console.log('📝 Other message type:', message.type);
      }
    } catch (error) {
      console.log('Error parsing WebView message:', error);
    }
  };

  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.log('🚨 WebView error:', nativeEvent);

    // ✅ DETECTAR si el error es en una URL de éxito (código 404 en payment-success)
    const isSuccessUrl = nativeEvent.url && (
      nativeEvent.url.includes('/payment-success') ||
      nativeEvent.url.includes('example.com/payment-success')
    );

    const hasPayerID = nativeEvent.url && nativeEvent.url.includes('PayerID=');

    // ✅ Si es error 404 en URL de éxito con PayerID, considerarlo exitoso
    if (nativeEvent.statusCode === 404 && isSuccessUrl && hasPayerID) {
      console.log('✅ Error 404 en URL de éxito con PayerID detectado - tratando como pago exitoso');

      if (!isProcessingPayment) {
            setIsProcessingPayment(true);

            // ✅ AUTOMÁTICO: Sin alert, directamente regresar y procesar
            setTimeout(() => {
              navigation.goBack();
              onPaymentSuccess && onPaymentSuccess(orderId);
            }, 500);
          }
      return; // No mostrar el alert de error
    }

    // ✅ Para otros errores, mostrar el alert normal
    Alert.alert(
      'Error de Conexión',
      `Hubo un problema cargando la página: ${nativeEvent.description || nativeEvent.code}. ¿Quieres intentar de nuevo?`,
      [
        {
          text: 'Cancelar',
          onPress: () => {
            navigation.goBack();
            onPaymentCancel && onPaymentCancel();
          },
          style: 'cancel'
        },
        {
          text: 'Reintentar',
          onPress: () => {
            setLoading(true);
            setIsProcessingPayment(false);
            processedUrls.current.clear();
            if (webViewRef.current) {
              webViewRef.current.reload();
            }
          }
        }
      ]
    );
  };

  const handleGoBack = () => {
    if (isProcessingPayment) {
      Alert.alert(
        'Pago en Proceso',
        'Tu pago se está procesando. ¿Estás seguro de que quieres salir? Si ya completaste el pago, presiona "Ya completé el pago".',
        [
          { text: 'Esperar', style: 'cancel' },
          {
            text: 'Ya completé el pago',
            onPress: () => {
              navigation.goBack();
              onPaymentSuccess && onPaymentSuccess(orderId);
            }
          },
          {
            text: 'Cancelar pago',
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
          {isProcessingPayment ? 'Procesando Pago...' : 'PayPal'}
        </Text>
        <TouchableOpacity onPress={handleGoBack} style={styles.closeButton}>
          <Icon name="close" size={24} color="#0070ba" />
        </TouchableOpacity>
      </View>

      {/* URL indicator */}
      <View style={styles.urlBar}>
        <Icon name={isProcessingPayment ? "checkmark-circle" : "lock-closed"}
              size={16}
              color={isProcessingPayment ? "#28a745" : "#0070ba"} />
        <Text style={[styles.urlText, isProcessingPayment && styles.urlTextSuccess]} numberOfLines={1}>
          {isProcessingPayment ? 'Pago procesado exitosamente' : (currentUrl || paypalUrl)}
        </Text>
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: paypalUrl }}
        style={[styles.webview, isProcessingPayment && styles.webviewProcessing]}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        onError={handleWebViewError}
        onHttpError={handleWebViewError}
        injectedJavaScript={injectedJavaScript}
        userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsBackForwardNavigationGestures={false}
        mixedContentMode="compatibility"
        thirdPartyCookiesEnabled={true}
        originWhitelist={['*']}
        allowsInlineMediaPlaybook={true}
        mediaPlaybackRequiresUserAction={false}
      />
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
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 2,
    backgroundColor: 'rgba(40, 167, 69, 0.95)',
    paddingVertical: 30,
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
    marginBottom: 8,
  },
  manualSection: {
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  manualSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  manualSectionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  manualConfirmButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#28a745',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  manualConfirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PayPalWebView;