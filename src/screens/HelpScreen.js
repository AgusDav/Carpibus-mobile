import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../styles/globalStyles';
import { useTheme } from '../hooks/useTheme';

export default function HelpScreen({ navigation }) {
  const theme = useTheme();

  const handleContactPress = async (type, value) => {
    try {
      let url = '';
      switch (type) {
        case 'phone':
          url = `tel:${value}`;
          break;
        case 'email':
          url = `mailto:${value}`;
          break;
        case 'whatsapp':
          url = `whatsapp://send?phone=${value}`;
          break;
        default:
          return;
      }

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Error',
          `No se puede abrir ${type === 'phone' ? 'la aplicación de teléfono' :
                            type === 'email' ? 'la aplicación de email' :
                            'WhatsApp'}`
        );
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'No se pudo abrir la aplicación');
    }
  };

  const ContactOption = ({ icon, title, subtitle, onPress, iconColor = theme.colors.textSecondary }) => (
    <TouchableOpacity style={localStyles.contactOption} onPress={onPress}>
      <View style={[localStyles.contactIcon, { backgroundColor: theme.colors.background }]}>
        <Icon name={icon} size={24} color={iconColor} />
      </View>
      <View style={localStyles.contactInfo}>
        <Text style={[globalStyles.textBody, { fontWeight: '600' }]}>{title}</Text>
        <Text style={globalStyles.textCaption}>{subtitle}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  const FAQItem = ({ question, answer }) => (
    <View style={localStyles.faqItem}>
      <Text style={[globalStyles.textBody, { fontWeight: '600', marginBottom: 8, lineHeight: 22 }]}>
        {question}
      </Text>
      <Text style={[globalStyles.textCaption, { lineHeight: 20 }]}>
        {answer}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={globalStyles.screenPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* Sección de Contacto */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.textHeading3, globalStyles.marginBottomSm]}>Contáctanos</Text>
          <Text style={[globalStyles.textCaption, globalStyles.marginBottomMd, { lineHeight: 20 }]}>
            Estamos aquí para ayudarte. Elige el método de contacto que prefieras.
          </Text>

          <ContactOption
            icon="call"
            title="Teléfono"
            subtitle="24/7 • +598 2 123 4567"
            iconColor={theme.colors.primary}
            onPress={() => handleContactPress('phone', '+59821234567')}
          />

          <ContactOption
            icon="logo-whatsapp"
            title="WhatsApp"
            subtitle="Respuesta rápida • +598 99 123 456"
            iconColor="#25D366"
            onPress={() => handleContactPress('whatsapp', '+59899123456')}
          />

          <ContactOption
            icon="mail"
            title="Email"
            subtitle="soporte@carpibus.com.uy"
            iconColor={theme.colors.secondary}
            onPress={() => handleContactPress('email', 'soporte@carpibus.com.uy')}
          />
        </View>

        {/* Horarios de Atención */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
            Horarios de Atención
          </Text>

          <View style={localStyles.scheduleContainer}>
            <View style={[globalStyles.row, localStyles.scheduleItem]}>
              <Icon name="time-outline" size={20} color={theme.colors.textSecondary} />
              <View style={localStyles.scheduleInfo}>
                <Text style={[globalStyles.textBody, { fontWeight: '500', marginBottom: 4 }]}>
                  Atención al Cliente
                </Text>
                <Text style={[globalStyles.textCaption, { lineHeight: 18 }]}>
                  Lunes a Viernes: 8:00 - 20:00{'\n'}
                  Sábados: 9:00 - 18:00{'\n'}
                  Domingos: 10:00 - 16:00
                </Text>
              </View>
            </View>

            <View style={[globalStyles.row, localStyles.scheduleItem]}>
              <Icon name="headset-outline" size={20} color={theme.colors.textSecondary} />
              <View style={localStyles.scheduleInfo}>
                <Text style={[globalStyles.textBody, { fontWeight: '500', marginBottom: 4 }]}>
                  Soporte Técnico
                </Text>
                <Text style={[globalStyles.textCaption, { lineHeight: 18 }]}>
                  Lunes a Viernes: 9:00 - 18:00{'\n'}
                  Sábados: 10:00 - 14:00
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Preguntas Frecuentes */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
            Preguntas Frecuentes
          </Text>

          <FAQItem
            question="¿Cómo puedo comprar un pasaje?"
            answer="Puedes comprar pasajes directamente desde la app seleccionando origen, destino y fecha. El pago se procesa de forma segura a través de PayPal."
          />

          <FAQItem
            question="¿Puedo cancelar mi pasaje?"
            answer="Sí, puedes cancelar tu pasaje hasta 24 horas antes de la salida."
          />

          <FAQItem
            question="¿Qué métodos de pago aceptan?"
            answer="Aceptamos pagos con tarjetas de crédito y débito a través de PayPal."
          />

          <FAQItem
            question="¿Qué pasa si pierdo mi pasaje?"
            answer="No te preocupes, todos los pasajes están guardados en tu cuenta. Puedes mostrar el código QR desde la app o solicitar una reimpresión en nuestra oficina."
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Estilos locales específicos
const localStyles = {
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  scheduleContainer: {
    gap: 16,
  },
  scheduleItem: {
    alignItems: 'flex-start',
    gap: 12,
  },
  scheduleInfo: {
    flex: 1,
  },
  faqItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  emergencyButton: {
    backgroundColor: '#FF5722',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emergencySubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoLinks: {
    gap: 8,
  },
  infoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
};