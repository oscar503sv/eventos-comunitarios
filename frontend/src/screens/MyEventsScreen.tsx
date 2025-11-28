import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../config/api';

// Tipos de datos
interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
}

interface Attendance {
  id: string;
  status: string; // 'confirmed' o 'cancelled'
  event: Event;
}

export default function MyEventsScreen({ navigation }: any) {
  // Estados del componente
  const [organized, setOrganized] = useState<Event[]>([]); // eventos que organicé
  const [attended, setAttended] = useState<Attendance[]>([]); // eventos a los que asistí
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'organized' | 'attended'>('organized');

  // Cargar datos del usuario
  const loadData = async () => {
    try {
      const response = await api.get('/events/my-events');
      setOrganized(response.data.organized);
      setAttended(response.data.attended);
    } catch (error) {
      console.error('Error loading my events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Recargar al enfocar pantalla
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Verificar si ya pasó
  const isPastEvent = (dateString: string) => new Date(dateString) < new Date();

  // Renderizar tarjeta de evento organizado
  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {isPastEvent(item.date) && (
          <View style={styles.pastBadge}>
            <Text style={styles.pastBadgeText}>Pasado</Text>
          </View>
        )}
      </View>
      <Text style={styles.eventDate}>📅 {formatDate(item.date)}</Text>
      <Text style={styles.eventLocation} numberOfLines={1}>
        📍 {item.location}
      </Text>
    </TouchableOpacity>
  );

  // Renderizar tarjeta de asistencia
  const renderAttendanceItem = ({ item }: { item: Attendance }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.event.id })}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {item.event.title}
        </Text>
        {/* Badge de estado de asistencia */}
        <View
          style={[
            styles.statusBadge,
            item.status === 'confirmed' ? styles.confirmedBadge : styles.cancelledBadge,
          ]}
        >
          <Text style={styles.statusText}>
            {item.status === 'confirmed' ? '✓ Confirmado' : '✗ Cancelado'}
          </Text>
        </View>
      </View>
      <Text style={styles.eventDate}>📅 {formatDate(item.event.date)}</Text>
      <Text style={styles.eventLocation} numberOfLines={1}>
        📍 {item.event.location}
      </Text>
    </TouchableOpacity>
  );

  // Pantalla de carga
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tabs de navegación */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'organized' && styles.activeTab]}
          onPress={() => setActiveTab('organized')}
        >
          <Text
            style={[styles.tabText, activeTab === 'organized' && styles.activeTabText]}
          >
            Organizados ({organized.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'attended' && styles.activeTab]}
          onPress={() => setActiveTab('attended')}
        >
          <Text
            style={[styles.tabText, activeTab === 'attended' && styles.activeTabText]}
          >
            Asistencias ({attended.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido según tab activo */}
      {activeTab === 'organized' ? (
        <FlatList
          data={organized}
          keyExtractor={(item) => item.id}
          renderItem={renderEventItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No has organizado ningún evento</Text>
              <TouchableOpacity
                style={styles.createLink}
                onPress={() => navigation.navigate('CreateEvent')}
              >
                <Text style={styles.createLinkText}>¡Crea tu primer evento!</Text>
              </TouchableOpacity>
            </View>
          }
        />
      ) : (
        <FlatList
          data={attended}
          keyExtractor={(item) => item.id}
          renderItem={renderAttendanceItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No te has registrado a ningún evento</Text>
              <TouchableOpacity
                style={styles.createLink}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.createLinkText}>¡Explora eventos!</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 15,
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
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  confirmedBadge: {
    backgroundColor: '#e8f5e9', // verde claro
  },
  cancelledBadge: {
    backgroundColor: '#ffebee', // rojo claro
  },
  statusText: {
    fontSize: 11,
    color: '#333',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
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
