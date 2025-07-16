import { StyleSheet, Platform } from 'react-native';
import { theme } from './theme';

export const globalStyles = StyleSheet.create({
  // ================================
  // CONTENEDORES Y LAYOUT
  // ================================

  // SafeArea mejorada para manejo de notch y barras
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Padding para pantallas principales
  screenPadding: {
    padding: theme.spacing.lg,
  },

  // ================================
  // HEADERS Y NAVEGACIÓN
  // ================================

  header: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.sm,
  },

  headerTitle: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },

  // ================================
  // TARJETAS Y COMPONENTES
  // ================================

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },

  // ================================
  // LAYOUT Y FLEXBOX
  // ================================

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  spaceBetween: {
    justifyContent: 'space-between',
  },

  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  flex1: {
    flex: 1,
  },

  // ================================
  // TIPOGRAFÍA
  // ================================

  textHeading1: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    color: theme.colors.text,
    lineHeight: theme.typography.h1.lineHeight,
  },

  textHeading2: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text,
    lineHeight: theme.typography.h2.lineHeight,
  },

  textHeading3: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
    lineHeight: theme.typography.h3.lineHeight,
  },

  textBody: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight,
    color: theme.colors.text,
    lineHeight: theme.typography.body.lineHeight,
  },

  textCaption: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.caption.fontWeight,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.caption.lineHeight,
  },

  textSmall: {
    fontSize: theme.typography.small.fontSize,
    fontWeight: theme.typography.small.fontWeight,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.small.lineHeight,
  },

  // ================================
  // BOTONES
  // ================================

  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },

  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },

  buttonTextSecondary: {
    color: theme.colors.primary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },

  // ================================
  // LISTAS
  // ================================

  listItem: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  listItemFirst: {
    borderTopLeftRadius: theme.spacing.sm,
    borderTopRightRadius: theme.spacing.sm,
  },

  listItemLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: theme.spacing.sm,
    borderBottomRightRadius: theme.spacing.sm,
  },

  // ================================
  // ESPACIADO
  // ================================

  marginBottomXs: {
    marginBottom: theme.spacing.xs,
  },

  marginBottomSm: {
    marginBottom: theme.spacing.sm,
  },

  marginBottomMd: {
    marginBottom: theme.spacing.md,
  },

  marginBottomLg: {
    marginBottom: theme.spacing.lg,
  },

  marginBottomXl: {
    marginBottom: theme.spacing.xl,
  },

  // ================================
  // ESTADOS Y UTILIDADES
  // ================================

  disabled: {
    opacity: 0.5,
  },

  hidden: {
    display: 'none',
  },

  // ================================
  // INPUTS Y FORMULARIOS
  // ================================

  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },

  inputFocused: {
    borderColor: theme.colors.primary,
  },

  inputError: {
    borderColor: theme.colors.error,
  },

  // ================================
  // LOADING Y ESTADOS VACÍOS
  // ================================

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },

  // ================================
  // ESPECÍFICOS PARA TABS (NUEVO)
  // ================================

  tabScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  tabContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
});