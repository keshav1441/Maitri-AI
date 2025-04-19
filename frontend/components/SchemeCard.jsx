import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const SchemeCard = ({ scheme, expanded, onToggleExpand }) => {
  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onToggleExpand} style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{scheme.title}</Text>
          <FontAwesome 
            name={expanded ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color="#6A0DAD" 
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Eligibility:</Text>
            <Text style={styles.sectionText}>{scheme.eligibility}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required Documents:</Text>
            {scheme.documents.map((doc, index) => (
              <View key={index} style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{doc}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to Apply:</Text>
            {scheme.steps.map((step, index) => (
              <View key={index} style={styles.bulletItem}>
                <Text style={styles.bullet}>{index + 1}.</Text>
                <Text style={styles.bulletText}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Benefits:</Text>
            <Text style={styles.sectionText}>{scheme.benefits}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#6A0DAD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  content: {
    marginTop: 12,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6A0DAD',
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingRight: 8,
  },
  bullet: {
    width: 20,
    fontSize: 14,
    color: '#6A0DAD',
    fontWeight: 'bold',
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
});

export default SchemeCard;