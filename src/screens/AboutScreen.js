import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function AboutScreen({ navigation }) {
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
    <View style={styles.statCard}>
      <Icon name={icon} size={32} color="#007AFF" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const FeatureItem = ({ icon, title, description }) => (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Icon name={icon} size={24} color="#007AFF" />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acerca de</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo y nombre de la empresa */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Icon name="bus" size={48} color="#007AFF" />
          </View>
          <Text style={styles.companyName}>Carpibus</Text>
          <Text style={styles.tagline}>Tu viaje, nuestra pasión</Text>
          <Text style={styles.version}>Versión 1.0.0</Text>
        </View>

        {/* Estadísticas de la empresa */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Nuestra Empresa en Números</Text>
          <View style={styles.statsGrid}>
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

        {/* Misión y Visión */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nuestra Misión</Text>
          <Text style={styles.missionText}>
            Conectar personas y lugares a través de un servicio de transporte seguro,
            cómodo y confiable, contribuyendo al desarrollo del turismo y la movilidad
            en Uruguay.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nuestra Visión</Text>
          <Text style={styles.visionText}>
            Ser la empresa líder en transporte de pasajeros de larga distancia en Uruguay,
            reconocida por la excelencia en el servicio, la innovación tecnológica y el
            compromiso con la sustentabilidad.
          </Text>
        </View>

        {/* Valores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nuestros Valores</Text>
          <View style={styles.valuesContainer}>
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Características de la App</Text>
          <View style={styles.appFeatures}>
            <FeatureItem
              icon="search"
              title="Búsqueda Fácil"
              description="Encuentra y compra pasajes de forma rápida y sencilla"
            />
            <FeatureItem
              icon="card"
              title="Pago Seguro"
              description="Múltiples métodos de pago con la máxima seguridad"
            />
            <FeatureItem
              icon="notifications"
              title="Notificaciones"
              description="Recibe actualizaciones sobre tus viajes en tiempo real"
            />
            <FeatureItem
              icon="time"
              title="Historial de Viajes"
              description="Consulta todos tus viajes anteriores y futuros"
            />
            <FeatureItem
              icon="location"
              title="Seguimiento"
              description="Rastrea tu ómnibus en tiempo real durante el viaje"
            />
            <FeatureItem
              icon="star"
              title="Sistema de Puntos"
              description="Acumula puntos y obtén beneficios exclusivos"
            />
          </View>
        </View>

        {/* Certificaciones y reconocimientos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certificaciones</Text>
          <View style={styles.certificationsContainer}>
            <View style={styles.certificationItem}>
              <Icon name="medal" size={24} color="#FFD700" />
              <Text style={styles.certificationText}>ISO 9001:2015</Text>
            </View>
            <View style={styles.certificationItem}>
              <Icon name="shield-checkmark" size={24} color="#4CAF50" />
              <Text style={styles.certificationText}>Certificación de Seguridad MTOP</Text>
            </View>
            <View style={styles.certificationItem}>
              <Icon name="leaf" size={24} color="#4CAF50" />
              <Text style={styles.certificationText}>Empresa Carbono Neutral</Text>
            </View>
          </View>
        </View>

        {/* Información de contacto corporativo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Oficinas Centrales</Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Icon name="location" size={20} color="#666" />
              <Text style={styles.contactText}>
                Av. 18 de Julio 1234, Montevideo, Uruguay
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Icon name="call" size={20} color="#666" />
              <Text style={styles.contactText}>+598 2 123 4567</Text>
            </View>
            <View style={styles.contactItem}>
              <Icon name="mail" size={20} color="#666" />
              <Text style={styles.contactText}>info@carpibus.com.uy</Text>
            </View>
          </View>
        </View>

        {/* Redes sociales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Síguenos</Text>
          <View style={styles.socialMedia}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => openURL('https://facebook.com/carpibus')}
            >
              <Icon name="logo-facebook" size={24} color="#1877F2" />
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => openURL('https://instagram.com/carpibus')}
            >
              <Icon name="logo-instagram" size={24} color="#E4405F" />
              <Text style={styles.socialText}>Instagram</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => openURL('https://twitter.com/carpibus')}
            >
              <Icon name="logo-twitter" size={24} color="#1DA1F2" />
              <Text style={styles.socialText}>Twitter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Información legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Legal</Text>
          <View style={styles.legalInfo}>
            <Text style={styles.legalText}>
              <Text style={styles.boldText}>Razón Social:</Text> CarpiBus S.A.
            </Text>
            <Text style={styles.legalText}>
              <Text style={styles.boldText}>RUT:</Text> 21.234.567.001
            </Text>
            <Text style={styles.legalText}>
              <Text style={styles.boldText}>Licencia MTOP:</Text> HAB-2023-001
            </Text>
            <Text style={styles.legalText}>
              <Text style={styles.boldText}>Registro de Comercio:</Text> Sección I, Nº 12345
            </Text>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>
            © 2025 CarpiBus S.A. Todos los derechos reservados.
          </Text>
          <Text style={styles.copyrightSubtext}>
            Desarrollado con ❤️ en Uruguay
          </Text>
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
  logoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: '#999',
  },
  statsSection: {
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
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
    marginBottom: 16,
  },
  missionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    textAlign: 'justify',
  },
  visionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    textAlign: 'justify',
  },
  valuesContainer: {
    gap: 16,
  },
  appFeatures: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  certificationsContainer: {
    gap: 12,
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  certificationText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  socialMedia: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    gap: 8,
  },
  socialText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  legalInfo: {
    gap: 8,
  },
  legalText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '600',
    color: '#333',
  },
  copyrightSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  copyrightText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  copyrightSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});