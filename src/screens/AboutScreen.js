import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../styles/globalStyles';
import { useTheme } from '../hooks/useTheme';

const { width: screenWidth } = Dimensions.get('window');

export default function AboutScreen({ navigation }) {
  const theme = useTheme();

  const openURL = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  const StatCard = ({ icon, title, value, subtitle }) => (
    <View style={[globalStyles.card, localStyles.statCard]}>
      <Icon name={icon} size={32} color={theme.colors.primary} />
      <Text style={[globalStyles.textHeading2, localStyles.statValue, { color: theme.colors.primary }]}>
        {value}
      </Text>
      <Text style={[globalStyles.textCaption, localStyles.statTitle]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[globalStyles.textSmall, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 2 }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  const FeatureItem = ({ icon, title, description }) => (
    <View style={[globalStyles.row, localStyles.featureItem]}>
      <View style={[localStyles.featureIcon, { backgroundColor: theme.colors.primary + '20' }]}>
        <Icon name={icon} size={24} color={theme.colors.primary} />
      </View>
      <View style={globalStyles.flex1}>
        <Text style={[globalStyles.textBody, { fontWeight: '600', marginBottom: 4 }]}>
          {title}
        </Text>
        <Text style={[globalStyles.textCaption, { lineHeight: 20 }]}>
          {description}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={globalStyles.screenPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo y nombre de la empresa */}
        <View style={[globalStyles.card, globalStyles.centerContent, localStyles.logoSection]}>
          <View style={[localStyles.logoContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <Icon name="bus" size={48} color={theme.colors.primary} />
          </View>
          <Text style={[globalStyles.textHeading1, { color: theme.colors.primary, textAlign: 'center' }]}>
            Carpibus
          </Text>
          <Text style={[globalStyles.textBody, { fontStyle: 'italic', textAlign: 'center', marginBottom: 8 }]}>
            Tu viaje, nuestra pasión
          </Text>
          <Text style={[globalStyles.textSmall, { color: theme.colors.textSecondary }]}>
            Versión 1.0.0
          </Text>
        </View>

        {/* Estadísticas de la empresa */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
            Nuestra Empresa en Números
          </Text>
          <View style={localStyles.statsGrid}>
            <StatCard
              icon="calendar"
              title="Años de experiencia"
              value="25+"
              subtitle="Desde 1999"
            />
            <StatCard
              icon="bus"
              title="Ómnibus en flota"
              value="150+"
              subtitle="Última tecnología"
            />
            <StatCard
              icon="location"
              title="Destinos"
              value="50+"
              subtitle="En todo el país"
            />
            <StatCard
              icon="people"
              title="Pasajeros anuales"
              value="2M+"
              subtitle="Clientes satisfechos"
            />
          </View>
        </View>

        {/* Misión */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
            Nuestra Misión
          </Text>
          <Text style={[globalStyles.textBody, { lineHeight: 22, textAlign: 'justify' }]}>
            Conectar personas y lugares a través de un servicio de transporte seguro,
            cómodo y confiable, contribuyendo al desarrollo del turismo y la movilidad
            en Uruguay.
          </Text>
        </View>

        {/* Visión */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
            Nuestra Visión
          </Text>
          <Text style={[globalStyles.textBody, { lineHeight: 22, textAlign: 'justify' }]}>
            Ser la empresa líder en transporte de pasajeros de larga distancia en Uruguay,
            reconocida por la excelencia en el servicio, la innovación tecnológica y el
            compromiso con la sustentabilidad.
          </Text>
        </View>

        {/* Valores */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
            Nuestros Valores
          </Text>
          <View style={localStyles.valuesContainer}>
            <FeatureItem
              icon="shield-checkmark"
              title="Seguridad"
              description="Priorizamos la seguridad de nuestros pasajeros en cada viaje"
            />
            <FeatureItem
              icon="heart"
              title="Calidad de Servicio"
              description="Brindamos una experiencia excepcional en cada viaje"
            />
            <FeatureItem
              icon="leaf"
              title="Sustentabilidad"
              description="Comprometidos con el cuidado del medio ambiente"
            />
            <FeatureItem
              icon="people"
              title="Compromiso Social"
              description="Contribuimos al desarrollo de las comunidades que visitamos"
            />
          </View>
        </View>

        {/* Características de la app */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
            Características de la App
          </Text>
          <View style={localStyles.appFeatures}>
            <FeatureItem
              icon="search"
              title="Búsqueda Fácil"
              description="Encuentra rápidamente los viajes que necesitas"
            />
            <FeatureItem
              icon="phone-portrait"
              title="Reserva Móvil"
              description="Compra tus pasajes desde tu teléfono"
            />
            <FeatureItem
              icon="notifications"
              title="Notificaciones"
              description="Mantente informado sobre tus viajes"
            />
            <FeatureItem
              icon="card"
              title="Pago Seguro"
              description="Múltiples opciones de pago con total seguridad"
            />
          </View>
        </View>

        {/* Certificaciones */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
            Certificaciones y Reconocimientos
          </Text>
          <View style={localStyles.certificationsContainer}>
            <View style={[globalStyles.row, localStyles.certificationItem]}>
              <Icon name="ribbon" size={24} color={theme.colors.success} style={{ marginRight: 12 }} />
              <Text style={globalStyles.textBody}>Certificación ISO 9001:2015</Text>
            </View>
            <View style={[globalStyles.row, localStyles.certificationItem]}>
              <Icon name="shield-checkmark" size={24} color={theme.colors.success} style={{ marginRight: 12 }} />
              <Text style={globalStyles.textBody}>Empresa Segura Certificada</Text>
            </View>
            <View style={[globalStyles.row, localStyles.certificationItem]}>
              <Icon name="leaf" size={24} color={theme.colors.success} style={{ marginRight: 12 }} />
              <Text style={globalStyles.textBody}>Sello Verde Empresarial</Text>
            </View>
          </View>
        </View>

        {/* Información de contacto */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
            Contacto
          </Text>
          <View style={localStyles.contactInfo}>
            <View style={[globalStyles.row, localStyles.contactItem]}>
              <Icon name="call" size={20} color={theme.colors.textSecondary} style={{ marginRight: 12 }} />
              <Text style={globalStyles.textBody}>0800 1234</Text>
            </View>
            <View style={[globalStyles.row, localStyles.contactItem]}>
              <Icon name="mail" size={20} color={theme.colors.textSecondary} style={{ marginRight: 12 }} />
              <Text style={globalStyles.textBody}>info@carpibus.com.uy</Text>
            </View>
            <View style={[globalStyles.row, localStyles.contactItem]}>
              <Icon name="location" size={20} color={theme.colors.textSecondary} style={{ marginRight: 12 }} />
              <Text style={globalStyles.textBody}>Terminal Tres Cruces, Montevideo</Text>
            </View>
          </View>
        </View>

        {/* Redes sociales */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
            Síguenos
          </Text>
          <View style={localStyles.socialMedia}>
            <TouchableOpacity
              style={[localStyles.socialButton, { backgroundColor: '#3b5998' }]}
              onPress={() => openURL('https://facebook.com/carpibus')}
            >
              <Icon name="logo-facebook" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={[globalStyles.textBody, { color: '#fff' }]}>Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[localStyles.socialButton, { backgroundColor: '#1da1f2' }]}
              onPress={() => openURL('https://twitter.com/carpibus')}
            >
              <Icon name="logo-twitter" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={[globalStyles.textBody, { color: '#fff' }]}>Twitter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Copyright */}
        <View style={[globalStyles.card, localStyles.copyrightSection]}>
          <Text style={[globalStyles.textSmall, { textAlign: 'center', marginBottom: 8 }]}>
            © 2024 Carpibus S.A. Todos los derechos reservados.
          </Text>
          <Text style={[globalStyles.textSmall, { textAlign: 'center', fontStyle: 'italic' }]}>
            Desarrollado con ❤️ en Uruguay
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Estilos locales específicos con mejoras para el layout responsivo
const localStyles = {
  logoSection: {
    paddingVertical: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  // Nuevo sistema de grid más robusto para las estadísticas
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -6, // Compensar el margen de las tarjetas
  },
  // Tarjeta de estadísticas con ancho calculado dinámicamente
  statCard: {
    // Calcular el ancho para asegurar exactamente 2 columnas
    width: (screenWidth - 48 - 24 - 12) / 2, // screenWidth - padding lateral - card padding - gap entre tarjetas
    alignItems: 'center',
    marginBottom: 12,
    marginHorizontal: 6, // Espacio entre tarjetas
    paddingVertical: 20,
    minHeight: 140, // Altura mínima para consistencia
  },
  statValue: {
    marginTop: 8,
    marginBottom: 4,
  },
  statTitle: {
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 18,
  },
  valuesContainer: {
    gap: 16,
  },
  appFeatures: {
    gap: 16,
  },
  featureItem: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  certificationsContainer: {
    gap: 12,
  },
  certificationItem: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    alignItems: 'center',
  },
  socialMedia: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  copyrightSection: {
    paddingVertical: 24,
  },
};