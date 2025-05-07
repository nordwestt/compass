import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAtom } from "jotai";
import { polarisServerAtom } from "@/src/hooks/atoms";
import PolarisServer, { CharacterDailyUsageDto, StatisticEntity } from "@/src/services/polaris/PolarisServer";
import { toastService } from "@/src/services/toastService";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalization } from "@/src/hooks/useLocalization";

// Helper function to format dates
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Helper function to group statistics by date
const groupByDate = (statistics: StatisticEntity[]) => {
  const grouped = statistics.reduce((acc, stat) => {
    const date = formatDate(new Date(stat.timestamp));
    if (!acc[date]) {
      acc[date] = {
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
        count: 0,
        avgDuration: 0,
      };
    }
    acc[date].totalTokens += stat.totalTokens;
    acc[date].promptTokens += stat.promptTokens;
    acc[date].completionTokens += stat.completionTokens;
    acc[date].avgDuration = 
      (acc[date].avgDuration * acc[date].count + stat.duration) / (acc[date].count + 1);
    acc[date].count += 1;
    return acc;
  }, {} as Record<string, { totalTokens: number, promptTokens: number, completionTokens: number, count: number, avgDuration: number }>);
  
  return grouped;
};

// Helper function to group statistics by model
const groupByModel = (statistics: StatisticEntity[]) => {
  const grouped = statistics.reduce((acc, stat) => {
    if (!acc[stat.modelId]) {
      acc[stat.modelId] = {
        totalTokens: 0,
        count: 0,
      };
    }
    acc[stat.modelId].totalTokens += stat.totalTokens;
    acc[stat.modelId].count += 1;
    return acc;
  }, {} as Record<string, { totalTokens: number, count: number }>);
  
  return grouped;
};

// Helper function to group statistics by character
const groupByCharacter = (statistics: CharacterDailyUsageDto[]) => {
  const grouped = statistics.reduce((acc, stat) => {
    if (!acc[stat.characterName]) {
      acc[stat.characterName] = {
        totalTokens: 0,
        count: 0,
      };
    }
    acc[stat.characterName].totalTokens += stat.totalTokens;
    acc[stat.characterName].count += 1;
    return acc;
  }, {} as Record<string, { totalTokens: number, count: number }>);
  
  return grouped;
};

export default function Statistics() {
  const { t } = useLocalization();
  const [polarisServerInfo] = useAtom(polarisServerAtom);
  const [statistics, setStatistics] = useState<StatisticEntity[]>([]);
  const [characterStatistics, setCharacterStatistics] = useState<CharacterDailyUsageDto[]>([]);
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default to last 30 days
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'usage' | 'characters' | 'models'>('usage');
  const [isLoading, setIsLoading] = useState(false);
  
  const screenWidth = Dimensions.get("window").width - 40; // Adjust for padding

  useEffect(() => {
    if (polarisServerInfo) {
      fetchStatistics();
    }
  }, [polarisServerInfo, startDate, endDate]);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      const stats = await PolarisServer.getStatistics(startDate, endDate);
      const charStats = await PolarisServer.getCharacterDailyStatistics(startDate, endDate);
      
      setStatistics(stats || []);
      setCharacterStatistics(charStats || []);
    } catch (error) {
      toastService.danger({
        title: "Error",
        description: "Failed to fetch statistics",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  // Prepare data for usage chart
  const prepareUsageChartData = () => {
    const groupedData = groupByDate(statistics);
    const dates = Object.keys(groupedData).sort();
    
    return {
      labels: dates.map(date => date.substring(5)), // Show only MM-DD
      datasets: [
        {
          data: dates.map(date => groupedData[date].totalTokens),
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
          strokeWidth: 2
        },
        {
          data: dates.map(date => groupedData[date].promptTokens),
          color: (opacity = 1) => `rgba(65, 105, 225, ${opacity})`,
          strokeWidth: 2
        },
        {
          data: dates.map(date => groupedData[date].completionTokens),
          color: (opacity = 1) => `rgba(50, 205, 50, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ["Total Tokens", "Prompt Tokens", "Completion Tokens"]
    };
  };

  // Prepare data for character usage chart
  const prepareCharacterChartData = () => {
    const groupedData = groupByCharacter(characterStatistics);
    const characters = Object.keys(groupedData).sort((a, b) => 
      groupedData[b].totalTokens - groupedData[a].totalTokens
    ).slice(0, 10); // Top 10 characters
    
    return {
      labels: characters.map(name => name.length > 10 ? name.substring(0, 10) + '...' : name),
      datasets: [
        {
          data: characters.map(char => groupedData[char].totalTokens),
          color: (opacity = 1) => `rgba(50, 205, 50, ${opacity})`,
        }
      ]
    };
  };

  // Prepare data for model usage chart
  const prepareModelChartData = () => {
    const groupedData = groupByModel(statistics);
    const models = Object.keys(groupedData).sort((a, b) => 
      groupedData[b].totalTokens - groupedData[a].totalTokens
    ).slice(0, 10); // Top 10 models
    
    return {
      labels: models.map(id => {
        const shortId = id.split('/').pop() || id;
        return shortId.length > 10 ? shortId.substring(0, 10) + '...' : shortId;
      }),
      datasets: [
        {
          data: models.map(model => groupedData[model].totalTokens),
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        }
      ]
    };
  };

  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientTo: "#08130D",
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
    },
  };

  const renderDatePickers = () => (
    <View className="flex-row justify-between items-center mb-4 bg-surface p-4 rounded-lg">
      <View className="flex-row items-center">
        <Text className="text-text mr-2">From:</Text>
        <TouchableOpacity 
          onPress={() => setShowStartDatePicker(true)}
          className="bg-primary/10 px-3 py-2 rounded-lg"
        >
          <Text className="text-primary">{formatDate(startDate)}</Text>
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
            maximumDate={endDate}
          />
        )}
      </View>
      
      <View className="flex-row items-center">
        <Text className="text-text mr-2">To:</Text>
        <TouchableOpacity 
          onPress={() => setShowEndDatePicker(true)}
          className="bg-primary/10 px-3 py-2 rounded-lg"
        >
          <Text className="text-primary">{formatDate(endDate)}</Text>
        </TouchableOpacity>
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
            minimumDate={startDate}
            maximumDate={new Date()}
          />
        )}
      </View>
      
      <TouchableOpacity 
        onPress={fetchStatistics}
        className="bg-primary px-4 py-2 rounded-lg flex-row items-center"
      >
        <Ionicons name="refresh" size={16} color="white" />
        <Text className="text-white ml-2">Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTabs = () => (
    <View className="flex-row mb-4">
      <TouchableOpacity 
        onPress={() => setActiveTab('usage')}
        className={`px-4 py-2 rounded-lg mr-2 ${activeTab === 'usage' ? 'bg-primary' : 'bg-surface'}`}
      >
        <Text className={activeTab === 'usage' ? 'text-white' : 'text-text'}>Token Usage</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => setActiveTab('characters')}
        className={`px-4 py-2 rounded-lg mr-2 ${activeTab === 'characters' ? 'bg-primary' : 'bg-surface'}`}
      >
        <Text className={activeTab === 'characters' ? 'text-white' : 'text-text'}>Character Usage</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => setActiveTab('models')}
        className={`px-4 py-2 rounded-lg ${activeTab === 'models' ? 'bg-primary' : 'bg-surface'}`}
      >
        <Text className={activeTab === 'models' ? 'text-white' : 'text-text'}>Model Usage</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSummary = () => {
    const totalTokens = statistics.reduce((sum, stat) => sum + stat.totalTokens, 0);
    const totalPromptTokens = statistics.reduce((sum, stat) => sum + stat.promptTokens, 0);
    const totalCompletionTokens = statistics.reduce((sum, stat) => sum + stat.completionTokens, 0);
    const totalRequests = statistics.length;
    const avgDuration = statistics.length > 0 
      ? statistics.reduce((sum, stat) => sum + stat.duration, 0) / statistics.length / 1000 
      : 0;
    
    return (
      <View className="flex-row justify-between mb-6">
        <View className="bg-surface p-4 rounded-lg flex-1 mr-2">
          <Text className="text-secondary text-sm">Total Tokens</Text>
          <Text className="text-primary text-xl font-bold">{totalTokens.toLocaleString()}</Text>
        </View>
        
        <View className="bg-surface p-4 rounded-lg flex-1 mr-2">
          <Text className="text-secondary text-sm">Total Requests</Text>
          <Text className="text-primary text-xl font-bold">{totalRequests.toLocaleString()}</Text>
        </View>
        
        <View className="bg-surface p-4 rounded-lg flex-1">
          <Text className="text-secondary text-sm">Avg Response Time</Text>
          <Text className="text-primary text-xl font-bold">{avgDuration.toFixed(2)}s</Text>
        </View>
      </View>
    );
  };

  const renderUsageChart = () => {
    if (statistics.length === 0) {
      return (
        <View className="bg-surface p-8 rounded-lg items-center justify-center">
          <Text className="text-secondary">No usage data available for the selected period</Text>
        </View>
      );
    }

    const data = prepareUsageChartData();
    
    return (
      <View className="bg-surface p-4 rounded-lg mb-6">
        <Text className="text-text font-bold mb-4">Token Usage Over Time</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={data}
            width={Math.max(screenWidth, data.labels.length * 50)} // Ensure enough width for all labels
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 16 }}
            fromZero
          />
        </ScrollView>
        <View className="flex-row justify-center mt-4">
          {data.legend.map((label, index) => (
            <View key={label} className="flex-row items-center mr-4">
              <View 
                style={{ 
                  width: 12, 
                  height: 12, 
                  backgroundColor: data.datasets[index].color(1),
                  borderRadius: 6,
                  marginRight: 4
                }} 
              />
              <Text className="text-secondary text-xs">{label}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderCharacterChart = () => {
    if (characterStatistics.length === 0) {
      return (
        <View className="bg-surface p-8 rounded-lg items-center justify-center">
          <Text className="text-secondary">No character usage data available for the selected period</Text>
        </View>
      );
    }

    const data = prepareCharacterChartData();
    
    return (
      <View className="bg-surface p-4 rounded-lg mb-6">
        <Text className="text-text font-bold mb-4">Top Characters by Token Usage</Text>
        <ScrollView className="rounded-lg" horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={data}
            width={Math.max(screenWidth, data.labels.length * 60)}
            height={220}
            chartConfig={chartConfig}
            style={{ borderRadius: 16, }}
            fromZero
            showValuesOnTopOfBars
            yAxisLabel="Tokens"
            yAxisSuffix=" tokens"
          />
        </ScrollView>
      </View>
    );
  };

  const renderModelChart = () => {
    if (statistics.length === 0) {
      return (
        <View className="bg-surface p-8 rounded-lg items-center justify-center">
          <Text className="text-secondary">No model usage data available for the selected period</Text>
        </View>
      );
    }

    const data = prepareModelChartData();
    
    return (
      <View className="bg-surface p-4 rounded-lg mb-6">
        <Text className="text-text font-bold mb-4">Top Models by Token Usage</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={data}
            width={Math.max(screenWidth, data.labels.length * 60)}
            height={220}
            chartConfig={chartConfig}
            style={{ borderRadius: 16 }}
            fromZero
            showValuesOnTopOfBars
            yAxisLabel="Tokens"
            yAxisSuffix=" tokens"
          />
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center p-4">
            <Ionicons
              name="stats-chart"
              size={32}
              className="!text-primary mr-2 pb-2"
            />
            <Text className="text-2xl font-bold text-primary">Statistics</Text>
          </View>
        </View>
        
        {renderDatePickers()}
        {renderSummary()}
        {renderTabs()}
        
        {isLoading ? (
          <View className="bg-surface p-8 rounded-lg items-center justify-center">
            <Text className="text-secondary">Loading statistics...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'usage' && renderUsageChart()}
            {activeTab === 'characters' && renderCharacterChart()}
            {activeTab === 'models' && renderModelChart()}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 