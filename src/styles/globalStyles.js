// styles/globalStyles.js
import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const globalStyles = StyleSheet.create({
  // Contenedores
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  screenPadding: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },

  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tarjetas y superficies
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },

  // Botones
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },

  buttonSecondary: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
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

  // Inputs
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },

  inputFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },

  inputError: {
    borderColor: theme.colors.error,
  },

  // Textos
  textHeading1: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },

  textHeading2: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },

  textHeading3: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },

  textBody: {
    ...theme.typography.body,
    color: theme.colors.text,
  },

  textCaption: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },

  textSmall: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },

  textError: {
    ...theme.typography.caption,
    color: theme.colors.error,
  },

  // Listas
  listItem: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  listItemFirst: {
    borderTopLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.md,
  },

  listItemLast: {
    borderBottomLeftRadius: theme.borderRadius.md,
    borderBottomRightRadius: theme.borderRadius.md,
    borderBottomWidth: 0,
  },

  // Navegación
  header: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.sm,
  },

  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    textAlign: 'center',
  },

  // Utilidades
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  spaceBetween: {
    justifyContent: 'space-between',
  },

  flex1: {
    flex: 1,
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

  paddingHorizontalMd: {
    paddingHorizontal: theme.spacing.md,
  },

  paddingVerticalMd: {
    paddingVertical: theme.spacing.md,
  },
});