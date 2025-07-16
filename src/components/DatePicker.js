import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Intentar importar DateTimePicker si está disponible
let DateTimePicker;
try {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
} catch (e) {
  DateTimePicker = null;
}

export default function DatePicker({
  label,
  value,
  onDateChange,
  placeholder = "Seleccionar fecha",
  minimumDate = null,
  maximumDate = null
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textValue, setTextValue] = useState('');

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('es-UY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return '';
    }
  };

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseTextDate = (text) => {
    // Intentar varios formatos
    const formats = [
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY
    ];

    for (let i = 0; i < formats.length; i++) {
      const match = text.match(formats[i]);
      if (match) {
        let year, month, day;

        if (i === 0) { // YYYY-MM-DD
          [, year, month, day] = match;
        } else { // DD/MM/YYYY o DD-MM-YYYY
          [, day, month, year] = match;
        }

        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(date.getTime())) {
          return formatDateForInput(date);
        }
      }
    }
    return null;
  };

  const handleNativePicker = (event, selectedDate) => {
    setShowPicker(false);
    if (event.type === 'set' && selectedDate) {
      const formattedDate = formatDateForInput(selectedDate);
      onDateChange(formattedDate);
    }
  };

  const handleTextInputSubmit = () => {
    const parsedDate = parseTextDate(textValue);
    if (parsedDate) {
      onDateChange(parsedDate);
      setShowTextInput(false);
      setTextValue('');
    } else {
      Alert.alert(
        'Fecha inválida',
        'Por favor ingresa una fecha válida en formato DD/MM/YYYY o YYYY-MM-DD',
        [{ text: 'OK' }]
      );
    }
  };

  const clearDate = () => {
    onDateChange('');
  };

  const openDateSelector = () => {
    if (DateTimePicker && Platform.OS === 'android') {
      // En Android, mostrar picker nativo directamente
      setShowPicker(true);
    } else if (DateTimePicker && Platform.OS === 'ios') {
      // En iOS, mostrar modal con picker
      setShowPicker(true);
    } else {
      // Fallback: mostrar input de texto
      setTextValue(value || '');
      setShowTextInput(true);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={styles.dateButton}
        onPress={openDateSelector}
      >
        <Icon name="calendar-outline" size={20} color="#666" />
        <Text style={[styles.dateText, !value && styles.placeholderText]}>
          {value ? formatDate(value) : placeholder}
        </Text>
        {value && (
          <TouchableOpacity onPress={clearDate} style={styles.clearButton}>
            <Icon name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Picker nativo para Android */}
      {showPicker && DateTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display="default"
          onChange={handleNativePicker}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {/* Modal para iOS */}
      {showPicker && DateTimePicker && Platform.OS === 'ios' && (
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={styles.pickerTitle}>{label || "Seleccionar fecha"}</Text>
                <TouchableOpacity onPress={() => {
                  setShowPicker(false);
                  // El valor ya se actualiza automáticamente en iOS
                }}>
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={value ? new Date(value) : new Date()}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    const formattedDate = formatDateForInput(selectedDate);
                    onDateChange(formattedDate);
                  }
                }}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.picker}
              />

              <View style={styles.pickerActions}>
                <TouchableOpacity onPress={clearDate} style={styles.clearDateButton}>
                  <Text style={styles.clearDateText}>Limpiar fecha</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal para input de texto (fallback) */}
      {showTextInput && (
        <Modal
          visible={showTextInput}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.textInputContainer}>
              <Text style={styles.textInputTitle}>Ingresar fecha</Text>
              <Text style={styles.textInputSubtitle}>
                Formato: DD/MM/YYYY o YYYY-MM-DD
              </Text>

              <TextInput
                style={styles.textInputField}
                value={textValue}
                onChangeText={setTextValue}
                placeholder="Ej: 25/12/2024 o 2024-12-25"
                placeholderTextColor="#999"
                autoFocus={true}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleTextInputSubmit}
              />

              <View style={styles.textInputActions}>
                <TouchableOpacity
                  style={styles.textInputCancel}
                  onPress={() => {
                    setShowTextInput(false);
                    setTextValue('');
                  }}
                >
                  <Text style={styles.textInputCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.textInputConfirm}
                  onPress={handleTextInputSubmit}
                >
                  <Text style={styles.textInputConfirmText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 8,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  clearButton: {
    padding: 4,
  },
  // Modal styles para iOS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
  },
  confirmButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  picker: {
    height: 200,
  },
  pickerActions: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  clearDateButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  clearDateText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
  },
  // Text input fallback styles
  textInputContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
  },
  textInputTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  textInputSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  textInputField: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  textInputActions: {
    flexDirection: 'row',
    gap: 12,
  },
  textInputCancel: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  textInputCancelText: {
    color: '#6b7280',
    fontSize: 16,
  },
  textInputConfirm: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  textInputConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});