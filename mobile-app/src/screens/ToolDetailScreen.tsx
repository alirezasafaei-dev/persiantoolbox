import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const toolConfigs: Record<string, any> = {
  loan: {
    name: 'محاسبه وام',
    icon: '💰',
    fields: [
      { key: 'amount', label: 'مبلغ وام (تومان)', type: 'number' },
      { key: 'rate', label: 'نرخ سود سالانه (%)', type: 'number' },
      { key: 'months', label: 'مدت بازپرداخت (ماه)', type: 'number' },
    ],
    calculate: (values: any) => {
      const principal = parseFloat(values.amount) || 0;
      const rate = parseFloat(values.rate) || 0;
      const months = parseInt(values.months) || 1;
      const monthlyRate = rate / 100 / 12;
      const payment =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
      const totalPayment = payment * months;
      const totalInterest = totalPayment - principal;
      return {
        monthlyPayment: Math.round(payment),
        totalPayment: Math.round(totalPayment),
        totalInterest: Math.round(totalInterest),
      };
    },
  },
  salary: {
    name: 'محاسبه حقوق',
    icon: '💵',
    fields: [
      { key: 'base', label: 'حقوق پایه', type: 'number' },
      { key: 'allowances', label: 'مزایا', type: 'number' },
      { key: 'insurance', label: 'بیمه', type: 'number' },
    ],
    calculate: (values: any) => {
      const base = parseFloat(values.base) || 0;
      const allowances = parseFloat(values.allowances) || 0;
      const insurance = parseFloat(values.insurance) || 0;
      const gross = base + allowances;
      const tax = gross * 0.1;
      const net = gross - tax - insurance;
      return { gross: Math.round(gross), tax: Math.round(tax), net: Math.round(net) };
    },
  },
  currency: {
    name: 'مبدل ارز',
    icon: '💱',
    fields: [
      { key: 'amount', label: 'مبلغ', type: 'number' },
      { key: 'from', label: 'از ارز', type: 'select', options: ['USD', 'EUR', 'IRR'] },
      { key: 'to', label: 'به ارز', type: 'select', options: ['USD', 'EUR', 'IRR'] },
    ],
    calculate: (values: any) => {
      const amount = parseFloat(values.amount) || 0;
      const rates: Record<string, number> = { USD: 1, EUR: 0.92, IRR: 42000 };
      const fromRate = rates[values.from] || 1;
      const toRate = rates[values.to] || 1;
      const result = (amount / fromRate) * toRate;
      return { result: Math.round(result * 100) / 100 };
    },
  },
};

export default function ToolDetailScreen({ route, navigation }: any) {
  const { toolId } = route.params;
  const config = toolConfigs[toolId] || {
    name: 'ابزار',
    icon: '🔧',
    fields: [],
    calculate: () => ({}),
  };

  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    const calcResult = config.calculate(values);
    setResult(calcResult);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>→</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{config.name}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          {config.fields.map((field: any) => (
            <View key={field.key} style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              {field.type === 'select' ? (
                <View style={styles.selectContainer}>
                  {field.options.map((opt: string) => (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.selectOption,
                        values[field.key] === opt && styles.selectOptionActive,
                      ]}
                      onPress={() => setValues({ ...values, [field.key]: opt })}
                    >
                      <Text
                        style={[
                          styles.selectOptionText,
                          values[field.key] === opt && styles.selectOptionTextActive,
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={values[field.key] || ''}
                  onChangeText={(text) => setValues({ ...values, [field.key]: text })}
                  placeholder="0"
                  placeholderTextColor="#94a3b8"
                />
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
            <Text style={styles.calculateButtonText}>محاسبه کن</Text>
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>نتیجه</Text>
            {Object.entries(result).map(([key, value]) => (
              <View key={key} style={styles.resultItem}>
                <Text style={styles.resultLabel}>{key}</Text>
                <Text style={styles.resultValue}>
                  {typeof value === 'number' ? value.toLocaleString('fa-IR') : String(value)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  backText: {
    fontSize: 24,
    color: '#6366f1',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  selectOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  selectOptionActive: {
    backgroundColor: '#6366f1',
  },
  selectOptionText: {
    fontSize: 14,
    color: '#64748b',
  },
  selectOptionTextActive: {
    color: '#ffffff',
  },
  calculateButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  resultContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  resultLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
});
