import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import api from '../config/api';
import { auth } from '../config/firebase';

// Tipos de datos
interface Review {
  id: string;
  rating: number;
  comment: string | null;
  user: { id: string; displayName: string | null };
  createdAt: string;
}

interface Attendance {
  id: string;
  status: string;
  user: { id: string; firebaseUid: string; displayName: string | null };
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  organizer: { id: string; firebaseUid: string; displayName: string | null; email: string };
  attendances: Attendance[];
  reviews: Review[];
}

export default function EventDetailScreen({ route, navigation }: any) {
  // Obtener eventId de los parámetros de navegación
  const { eventId } = route.params;

  // Estados del componente
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAttending, setIsAttending] = useState(false);
  const [myAttendanceStatus, setMyAttendanceStatus] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [stats, setStats] = useState({ average: 0, count: 0 });

  // UID del usuario actual de Firebase
  const currentUserUid = auth.currentUser?.uid;

  // Cargar datos al montar el componente
  useEffect(() => {
    loadEvent();
    loadReviews();
  }, [eventId]);

  // Obtener detalles del evento
  const loadEvent = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      const eventData = response.data.event;
      setEvent(eventData);

      // Buscar si el usuario actual tiene asistencia confirmada
      const myAttendance = eventData.attendances.find(
        (a: Attendance) => a.user.firebaseUid === currentUserUid
      );
      if (myAttendance) {
        setMyAttendanceStatus(myAttendance.status);
        setIsAttending(myAttendance.status === 'confirmed');
      }
    } catch (error) {
      console.error('Error loading event:', error);
      Alert.alert('Error', 'No se pudo cargar el evento');
    } finally {
      setLoading(false);
    }
  };

  // Obtener estadísticas de reseñas
  const loadReviews = async () => {
    try {
      const response = await api.get(`/reviews/${eventId}`);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  // Confirmar asistencia al evento
  const handleAttend = async () => {
    try {
      await api.post(`/events/${eventId}/attend`);
      setIsAttending(true);
      setMyAttendanceStatus('confirmed');
      Alert.alert('¡Listo!', 'Has confirmado tu asistencia');
      loadEvent(); // recargar para actualizar lista de asistentes
    } catch (error) {
      console.error('Error attending:', error);
      Alert.alert('Error', 'No se pudo confirmar asistencia');
    }
  };

  // Cancelar asistencia
  const handleCancelAttendance = async () => {
    try {
      await api.post(`/events/${eventId}/cancel`);
      setIsAttending(false);
      setMyAttendanceStatus('cancelled');
      Alert.alert('Cancelado', 'Has cancelado tu asistencia');
      loadEvent();
    } catch (error) {
      console.error('Error cancelling:', error);
      Alert.alert('Error', 'No se pudo cancelar asistencia');
    }
  };

  // Enviar reseña
  const handleSubmitReview = async () => {
    try {
      await api.post(`/reviews/${eventId}`, { rating, comment });
      Alert.alert('¡Gracias!', 'Tu reseña ha sido enviada');
      setShowReviewForm(false);
      setComment('');
      loadEvent();
      loadReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'No se pudo enviar la reseña');
    }
  };

  // Formatear fecha completa
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Verificar si el evento ya pasó
  const isPastEvent = event ? new Date(event.date) < new Date() : false;

  // Pantalla de carga
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Evento no encontrado
  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Evento no encontrado</Text>
      </View>
    );
  }

  // Filtrar solo asistentes confirmados
  const confirmedAttendees = event.attendances.filter(a => a.status === 'confirmed');

  return (
    <ScrollView style={styles.container}>
      {/* Header con título y stats */}
      <View style={styles.header}>
        <Text style={styles.title}>{event.title}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>⭐ {stats.average.toFixed(1)} ({stats.count} reseñas)</Text>
          <Text style={styles.statText}>👥 {confirmedAttendees.length} asistentes</Text>
        </View>
      </View>

      {/* Fecha del evento */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📅 Fecha y Hora</Text>
        <Text style={styles.text}>{formatDate(event.date)}</Text>
      </View>

      {/* Ubicación */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📍 Ubicación</Text>
        <Text style={styles.text}>{event.location}</Text>
      </View>

      {/* Descripción (si existe) */}
      {event.description && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📝 Descripción</Text>
          <Text style={styles.text}>{event.description}</Text>
        </View>
      )}

      {/* Organizador */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>👤 Organizador</Text>
        <Text style={styles.text}>
          {event.organizer.displayName || event.organizer.email}
        </Text>
      </View>

      {/* Botón de editar (solo visible para el organizador y si el evento no ha pasado) */}
      {event.organizer.firebaseUid === currentUserUid && !isPastEvent && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('CreateEvent', { event })}
          >
            <Text style={styles.editButtonText}>✏️ Editar Evento</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botón de asistencia (solo si el evento no ha pasado) */}
      {!isPastEvent && (
        <View style={styles.actionContainer}>
          {!isAttending ? (
            <TouchableOpacity style={styles.attendButton} onPress={handleAttend}>
              <Text style={styles.attendButtonText}>✅ Confirmar Asistencia</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelAttendance}>
              <Text style={styles.cancelButtonText}>❌ Cancelar Asistencia</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Sección de reseñas (solo si el evento ya pasó) */}
      {isPastEvent && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>⭐ Reseñas</Text>
          
          {/* Botón o formulario de reseña (solo si el usuario confirmó asistencia) */}
          {isAttending && (
            !showReviewForm ? (
              <TouchableOpacity
                style={styles.reviewButton}
                onPress={() => setShowReviewForm(true)}
              >
                <Text style={styles.reviewButtonText}>Escribir Reseña</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.reviewForm}>
                {/* Selector de calificación */}
                <Text style={styles.label}>Calificación:</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                      <Text style={styles.star}>
                        {star <= rating ? '⭐' : '☆'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Campo de comentario */}
                <Text style={styles.label}>Comentario (opcional):</Text>
                <TextInput
                  style={styles.input}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Escribe tu comentario..."
                  multiline
                  numberOfLines={3}
                />

                {/* Botones del formulario */}
                <View style={styles.reviewFormButtons}>
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmitReview}
                  >
                    <Text style={styles.submitButtonText}>Enviar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelReviewButton}
                    onPress={() => setShowReviewForm(false)}
                  >
                    <Text style={styles.cancelReviewText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          )}

          {/* Lista de reseñas existentes */}
          {event.reviews.length > 0 && (
            <View style={styles.reviewsList}>
              {event.reviews.map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <Text style={styles.reviewUser}>
                    {review.user.displayName || 'Usuario'}
                  </Text>
                  <Text style={styles.reviewRating}>
                    {'⭐'.repeat(review.rating)}
                  </Text>
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Lista de asistentes confirmados */}
      {confirmedAttendees.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>👥 Asistentes ({confirmedAttendees.length})</Text>
          {confirmedAttendees.slice(0, 5).map((attendance) => (
            <Text key={attendance.id} style={styles.attendeeName}>
              • {attendance.user.displayName || 'Usuario'}
            </Text>
          ))}
          {confirmedAttendees.length > 5 && (
            <Text style={styles.moreText}>
              +{confirmedAttendees.length - 5} más...
            </Text>
          )}
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  statText: {
    color: '#fff',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    marginBottom: 0,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  text: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  actionContainer: {
    padding: 15,
  },
  attendButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  attendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#FF9500',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  reviewButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  reviewForm: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  star: {
    fontSize: 30,
    marginRight: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  reviewFormButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  submitButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelReviewButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  cancelReviewText: {
    color: '#666',
    fontWeight: '600',
  },
  reviewsList: {
    marginTop: 10,
  },
  reviewItem: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 10,
  },
  reviewUser: {
    fontWeight: '600',
    fontSize: 14,
  },
  reviewRating: {
    marginVertical: 3,
  },
  reviewComment: {
    color: '#666',
    fontSize: 14,
  },
  attendeeName: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  moreText: {
    color: '#007AFF',
    marginTop: 5,
  },
});
