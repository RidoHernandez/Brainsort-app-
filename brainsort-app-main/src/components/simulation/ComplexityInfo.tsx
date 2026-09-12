import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../styles/colors';

interface ComplexityInfoProps {
  time: string;
  space: string;
}

/**
 * T-FE-071: Muestra Big O del algoritmo (complejidadTiempo, complejidadEspacio)
 */
export const ComplexityInfo = ({ time, space }: ComplexityInfoProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Text style={styles.label}>Complejidad Tiempo</Text>
        <Text style={styles.value}>{time}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.item}>
        <Text style={styles.label}>Complejidad Espacio</Text>
        <Text style={styles.value}>{space}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: Colors.neutral[0],
    borderRadius: 8,
    marginVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
  },
  label: {
    color: Colors.neutral[500],
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  value: {
    color: Colors.primary[600],
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#3A3A3C',
  },
});
