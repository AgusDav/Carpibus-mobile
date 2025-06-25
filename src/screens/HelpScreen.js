import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function HelpScreen({ navigation }) {
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

  const ContactOption = ({ icon, title, subtitle, onPress, iconColor = '#666' }) => (
    <TouchableOpacity style={styles.contactOption} onPress={onPress}>
      <View style={styles.contactIcon}>
        <Icon name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const FAQItem = ({ question, answer }) => (
    <View style={styles.faqItem}>
      <Text style={styles.faqQuestion}>{question}</Text>
      <Text style={styles.faqAnswer}>{answer}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayuda</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sección de Contacto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contáctanos</Text>
          <Text style={styles.sectionSubtitle}>
            Estamos aquí para ayudarte. Elige la opción que prefieras:
          </Text>

          <ContactOption
            icon="call"
            title="Teléfono"
            subtitle="3232 - Atención 24/7"
            iconColor="#4CAF50"
            onPress={() => handleContactPress('phone', '3232')}
          />

          <ContactOption
            icon="mail"
            title="Email"
            subtitle="info@carpibus.com.uy"
            iconColor="#2196F3"
            onPress={() => handleContactPress('email', 'info@carpibus.com.uy')}
          />

          <ContactOption
            icon="logo-whatsapp"
            title="WhatsApp"
            subtitle="+598 99 123 456"
            iconColor="#25D366"
            onPress={() => handleContactPress('whatsapp', '+59899123456')}
          />

          <ContactOption
            icon="chatbubbles"
            title="Chat en Vivo"
            subtitle="Disponible de 8:00 a 22:00"
            iconColor="#FF9800"
            onPress={() => Alert.alert('Chat', 'Funcionalidad próximamente disponible')}
          />
        </View>

        {/* Horarios de atención */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horarios de Atención</Text>

          <View style={styles.scheduleContainer}>
            <View style={styles.scheduleItem}>
              <Icon name="call" size={20} color="#4CAF50" />
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleTitle}>Teléfono</Text>
                <Text style={styles.scheduleTime}>24 horas, todos los días</Text>
              </View>
            </View>

            <View style={styles.scheduleItem}>
              <Icon name="mail" size={20} color="#2196F3" />
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleTitle}>Email</Text>
                <Text style={styles.scheduleTime}>Respuesta en 24-48 horas</Text>
              </View>
            </View>

            <View style={styles.scheduleItem}>
              <Icon name="chatbubbles" size={20} color="#FF9800" />
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleTitle}>Chat y WhatsApp</Text>
                <Text style={styles.scheduleTime}>Lunes a Domingo: 8:00 - 22:00</Text>
              </View>
            </View>

            <View style={styles.scheduleItem}>
              <Icon name="storefront" size={20} color="#9C27B0" />
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleTitle}>Agencias</Text>
                <Text style={styles.scheduleTime}>Lunes a Viernes: 8:00 - 18:00</Text>
                <Text style={styles.scheduleTime}>Sábados: 8:00 - 14:00</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Preguntas Frecuentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preguntas Frecuentes</Text>

          <FAQItem
            question="¿Cómo puedo comprar un pasaje?"
            answer="Puedes comprar pasajes directamente desde la app seleccionando origen, destino y fecha. También puedes hacerlo en nuestras agencias o llamando al 3232."
          />

          <FAQItem
            question="¿Puedo cancelar o cambiar mi pasaje?"
            answer="Sí, puedes cancelar o cambiar tu pasaje hasta 2 horas antes de la salida. Aplican condiciones según el tipo de tarifa."
          />

          <FAQItem
            question="¿Qué equipaje puedo llevar?"
            answer="Puedes llevar equipaje de mano (hasta 5kg) y equipaje de bodega (hasta 25kg) sin costo adicional. Equipaje adicional tiene tarifas especiales."
          />

          <FAQItem
            question="¿Cómo recibo mi pasaje?"
            answer="Después de la compra, recibirás tu pasaje por email y también estará disponible en la sección 'Mis Viajes' de la app."
          />

          <FAQItem
            question="¿Qué hago si pierdo mi pasaje?"
            answer="No te preocupes. Puedes mostrar tu pasaje desde la app o contactarnos con tu número de reserva para reenviar el pasaje por email."
          />

          <FAQItem
            question="¿Hay descuentos disponibles?"
            answer="Ofrecemos descuentos para estudiantes, jubilados y niños. También tenemos promociones especiales durante el año."
          />
        </View>

        {/* Información de emergencia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>En caso de emergencia</Text>
          <Text style={styles.emergencyText}>
            Si tienes una emergencia durante tu viaje o necesitas asistencia inmediata:
          </Text>

          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => handleContactPress('phone', '3232')}
          >
            <Icon name="warning" size={24} color="#fff" />
            <Text style={styles.emergencyButtonText}>Llamar al 3232</Text>
          </TouchableOpacity>

          <Text style={styles.emergencySubtext}>
            Línea de emergencia disponible 24/7
          </Text>
        </View>

        {/* Información adicional */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Más Información</Text>

          <View style={styles.infoLinks}>
            <TouchableOpacity style={styles.infoLink}>
              <Icon name="document-text" size={20} color="#666" />
              <Text style={styles.infoLinkText}>Términos y Condiciones</Text>
              <Icon name="chevron-forward" size={16} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoLink}>
              <Icon name="shield-checkmark" size={20} color="#666" />
              <Text style={styles.infoLinkText}>Política de Privacidad</Text>
              <Icon name="chevron-forward" size={16} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoLink}>
              <Icon name="card" size={20} color="#666" />
              <Text style={styles.infoLinkText}>Métodos de Pago</Text>
              <Icon name="chevron-forward" size={16} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
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
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  scheduleContainer: {
    gap: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  faqItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emergencyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
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
  infoLinkText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});