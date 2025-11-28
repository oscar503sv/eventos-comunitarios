/**
 * Componente principal de la aplicación
 * Configura la navegación entre pantallas usando React Navigation
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import CreateEventScreen from './src/screens/CreateEventScreen';
import MyEventsScreen from './src/screens/MyEventsScreen';

// Crear el stack navigator para la navegación
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* Pantalla de inicio de sesión (pantalla inicial) */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        {/* Pantalla de registro de nuevos usuarios */}
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ 
            title: 'Registro',
            headerBackTitle: 'Atrás',
          }} 
        />
        {/* Pantalla principal (después del login exitoso) */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }} 
        />
        {/* Detalle de evento */}
        <Stack.Screen 
          name="EventDetail" 
          component={EventDetailScreen} 
          options={{ 
            title: 'Evento',
            headerBackTitle: 'Atrás',
          }} 
        />
        {/* Crear evento */}
        <Stack.Screen 
          name="CreateEvent" 
          component={CreateEventScreen} 
          options={{ 
            title: 'Crear Evento',
            headerBackTitle: 'Atrás',
          }} 
        />
        {/* Mis eventos */}
        <Stack.Screen 
          name="MyEvents" 
          component={MyEventsScreen} 
          options={{ 
            title: 'Mis Eventos',
            headerBackTitle: 'Atrás',
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
