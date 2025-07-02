import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Para React Native, usaremos DateTimePicker de @react-native-community/datetimepicker
// Si no está instalado, se puede usar un input de texto como fallback
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
  const [tempDate, setTempDate] = useState(value ? new Date(value) : new Date());

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateConfirm = () => {
    const formattedDate = formatDateForInput(tempDate);
    onDateChange(formattedDate);
    setShowPicker(false);
  };

  const handleDateCancel = () => {
    setTempDate(value ? new Date(value) : new Date());
    setShowPicker(false);
  };

  const clearDate = () => {
    onDateChange('');
    setShowPicker(false);
  };

  // Si DateTimePicker está disponible, usar el picker nativo
  if (DateTimePicker) {
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowPicker(true)}
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

        {showPicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              if (event.type === 'set' && selectedDate) {
                const formattedDate = formatDateForInput(selectedDate);
                onDateChange(formattedDate);
              }
              setShowPicker(false);
            }}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )}

        {showPicker && Platform.OS === 'ios' && (
          <Modal
            visible={showPicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={handleDateCancel}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <Text style={styles.pickerTitle}>{label || "Seleccionar fecha"}</Text>
                  <TouchableOpacity onPress={handleDateConfirm}>
                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                  </TouchableOpacity>
                </View>

                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setTempDate(selectedDate);
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
      </View>
    );
  }

  // Fallback: usar input de texto simple
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => {
          // En caso de no tener DateTimePicker, mostrar un input simple
          // Esto podría abrirse en un modal con un calendario personalizado
          console.log('DateTimePicker no disponible - implementar calendario personalizado');
        }}
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
    paddingBottom: 34, // Para el safe area de iOS
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
});