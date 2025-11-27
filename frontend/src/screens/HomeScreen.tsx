import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../config/api';

// Tipo para los datos de un evento
interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  organizer: { displayName: string | null; email: string };
  _count: { attendances: number; reviews: number }; // contadores de asistentes y reseñas
}

export default function HomeScreen({ navigation }: any) {
  // Usuario actual de Firebase
  const user = auth.currentUser;

  // Estados del componente
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar eventos desde la API
  const loadEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Recargar eventos cada vez que la pantalla tiene foco
  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  // Cerrar sesión con confirmación
  const handleLogout = async () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.replace('Login');
          } catch (error: any) {
            Alert.alert('Error', 'No se pudo cerrar sesión');
          }
        },
      },
    ]);
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Verificar si el evento ya pasó
  const isPastEvent = (dateString: string) => new Date(dateString) < new Date();

  // Renderizar cada tarjeta de evento
  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={[styles.eventCard, isPastEvent(item.date) && styles.pastEventCard]}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
    >
      {/* Título y badge de finalizado */}
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {isPastEvent(item.date) && (
          <View style={styles.pastBadge}>
            <Text style={styles.pastBadgeText}>Finalizado</Text>
          </View>
        )}
      </View>

      {/* Fecha y ubicación */}
      <Text style={styles.eventDate}>📅 {formatDate(item.date)}</Text>
      <Text style={styles.eventLocation} numberOfLines={1}>
        📍 {item.location}
      </Text>

      {/* Organizador y estadísticas */}
      <View style={styles.eventFooter}>
        <Text style={styles.eventOrganizer}>
          Por: {item.organizer.displayName || item.organizer.email}
        </Text>
        <Text style={styles.eventStats}>
          👥 {item._count.attendances} • ⭐ {item._count.reviews}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header con saludo y logout */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>👋 Hola!</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
          <Text style={styles.logoutIconText}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Botones de navegación */}
      <View style={styles.navButtons}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('CreateEvent')}
        >
          <Text style={styles.navButtonText}>➕ Crear Evento</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonSecondary]}
          onPress={() => navigation.navigate('MyEvents')}
        >
          <Text style={styles.navButtonTextSecondary}>📋 Mis Eventos</Text>
        </TouchableOpacity>
      </View>

      {/* Título de sección */}
      <Text style={styles.sectionTitle}>Próximos Eventos</Text>

      {/* Lista de eventos o loading */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEventItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay eventos disponibles</Text>
              <TouchableOpacity
                style={styles.createLink}
                onPress={() => navigation.navigate('CreateEvent')}
              >
                <Text style={styles.createLinkText}>¡Crea el primero!</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  emailText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  logoutIcon: {
    padding: 8,
  },
  logoutIconText: {
    fontSize: 24,
  },
  navButtons: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  navButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  navButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  navButtonTextSecondary: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 15,
    paddingBottom: 10,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 15,
    paddingTop: 0,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pastEventCard: {
    opacity: 0.7,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  pastBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  pastBadgeText: {
    fontSize: 11,
    color: '#666',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    marginTop: 4,
  },
  eventOrganizer: {
    fontSize: 12,
    color: '#999',
    flex: 1,
  },
  eventStats: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 15,
  },
  createLink: {
    padding: 10,
  },
  createLinkText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
