import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../config/api';

export default function CreateEventScreen({ route, navigation }: any) {
  // Obtener evento a editar si existe (modo edición)
  const eventToEdit = route.params?.event;
  const isEditMode = !!eventToEdit;

  // Estados del formulario (pre-llenar si es edición)
  const [title, setTitle] = useState(eventToEdit?.title || '');
  const [description, setDescription] = useState(eventToEdit?.description || '');
  const [location, setLocation] = useState(eventToEdit?.location || '');
  const [date, setDate] = useState(eventToEdit ? new Date(eventToEdit.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cambiar título de la pantalla según el modo
  useEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Editar Evento' : 'Crear Evento',
    });
  }, [isEditMode]);

  // Crear o actualizar evento en la API
  const handleSubmit = async () => {
    // Validaciones
    if (!title.trim()) {
      Alert.alert('Error', 'El título es requerido');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Error', 'La ubicación es requerida');
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        title: title.trim(),
        description: description.trim() || null,
        date: date.toISOString(),
        location: location.trim(),
      };

      if (isEditMode) {
        // Actualizar evento existente
        await api.put(`/events/${eventToEdit.id}`, eventData);
        Alert.alert('¡Éxito!', 'Evento actualizado correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        // Crear nuevo evento
        await api.post('/events', eventData);
        Alert.alert('¡Éxito!', 'Evento creado correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      console.error('Error saving event:', error);
      const errorMsg = error.response?.data?.error || 'No se pudo guardar el evento';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de fecha
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setDate(newDate);
    }
  };

  // Manejar cambio de hora
  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (d: Date) => {
    return d.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Formatear hora para mostrar
  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Campo título */}
        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Nombre del evento"
          maxLength={100}
        />

        {/* Campo descripción */}
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe tu evento (opcional)"
          multiline
          numberOfLines={4}
        />

        {/* Campo ubicación */}
        <Text style={styles.label}>Ubicación *</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="¿Dónde será el evento?"
        />

        {/* Selectores de fecha y hora */}
        <Text style={styles.label}>Fecha y Hora *</Text>
        <View style={styles.dateTimeRow}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>📅 {formatDate(date)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.dateButtonText}>🕐 {formatTime(date)}</Text>
          </TouchableOpacity>
        </View>

        {/* DatePicker nativo */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={isEditMode ? undefined : new Date()}
          />
        )}

        {/* TimePicker nativo */}
        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
        )}

        {/* Botón crear/actualizar */}
        <TouchableOpacity
          style={[styles.createButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading
              ? 'Guardando...'
              : isEditMode
              ? '💾 Guardar Cambios'
              : '✨ Crear Evento'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#333',
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
