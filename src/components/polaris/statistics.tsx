import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAtom } from "jotai";
import { polarisServerAtom } from "@/src/hooks/atoms";
import PolarisServer, { DailyUsageDto, StatisticEntity } from "@/src/services/polaris/PolarisServer";
import { toastService } from "@/src/services/toastService";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import { useLocalization } from "@/src/hooks/useLocalization";
import DatePicker from "@/src/components/ui/DatePicker";

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
const groupByCharacter = (statistics: DailyUsageDto[]) => {
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

// Mock data functions
const getMockModelDistribution = () => {
  return [
    { name: 'GPT-4', tokens: 1250000, color: '#FF6384' },
    { name: 'Claude 3', tokens: 980000, color: '#36A2EB' },
    { name: 'Llama 3', tokens: 750000, color: '#FFCE56' },
    { name: 'Mistral', tokens: 420000, color: '#4BC0C0' },
    { name: 'GPT-3.5', tokens: 350000, color: '#9966FF' },
    { name: 'Other', tokens: 180000, color: '#C9CBCF' },
  ];
};

const getMockCharacterDistribution = () => {
  return [
    { name: 'GPT-4', tokens: 1250000, color: '#FF6384' },
  ];
};

const getMockUserEngagement = () => {
  return {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [120, 145, 132, 158, 142, 85, 78],
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: ["Active Users"]
  };
};

const getMockPerformanceMetrics = () => {
  return {
    labels: ["GPT-4", "Claude 3", "Llama 3", "Mistral", "GPT-3.5"],
    datasets: [
      {
        data: [2.1, 1.8, 3.2, 2.7, 1.5],
        color: (opacity = 1) => `rgba(50, 205, 50, ${opacity})`,
      }
    ]
  };
};

export default function Statistics() {
  const { t } = useLocalization();
  const [polarisServerInfo] = useAtom(polarisServerAtom);
  const [statistics, setStatistics] = useState<StatisticEntity[]>([]);
  const [dailyStatistics, setDailyStatistics] = useState<DailyUsageDto[]>([]);
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default to last 30 days
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'usage' | 'models' | 'characters' | 'users' | 'performance'>('usage');
  const [isLoading, setIsLoading] = useState(false);
  
  const screenWidth = Dimensions.get("window").width - 40; // Adjust for padding
  const isWideScreen = screenWidth > 768;

  useEffect(() => {
    if (polarisServerInfo) {
      fetchStatistics();
    }
  }, [polarisServerInfo, startDate, endDate]);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      const stats = await PolarisServer.getStatistics(startDate, endDate);
      const dailyStats = await PolarisServer.getDailyUsageStatistics(startDate, endDate);
      console.log("Character statists",dailyStats);
      setStatistics(stats || []);
      setDailyStatistics(dailyStats || []);
    } catch (error) {
      toastService.danger({
        title: "Error",
        description: "Failed to fetch statistics",
      });
    } finally {
      setIsLoading(false);
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
  const prepareCharacterData = () => {
    // group by characterName and sum the totalTokens
    const groupedData = dailyStatistics.reduce((acc: { [key: string]: number }, character) => {
      acc[character.characterName] = (acc[character.characterName] || 0) + character.totalTokens;
      return acc;
    }, {});

    // convert groupedData to an array of objects
    const characterData = Object.entries(groupedData).map(([characterName, totalTokens]) => ({
      name: characterName,
      tokens: totalTokens,
      color: `hsl(${Math.abs(characterName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 360}, 70%, 50%)`,
    }));
    
    return characterData;
  };

  // Prepare data for model usage chart
  const prepareModelData = () => {
    // group by characterName and sum the totalTokens
    const groupedData = dailyStatistics.reduce((acc: { [key: string]: number }, character) => {
      acc[character.modelId] = (acc[character.modelId] || 0) + character.totalTokens;
      return acc;
    }, {});

    // convert groupedData to an array of objects
    const modelData = Object.entries(groupedData).map(([modelId, totalTokens]) => ({
      name: modelId,
      tokens: totalTokens,
      color: `hsl(${Math.abs(modelId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 360}, 70%, 50%)`,
    }));
    
    return modelData;
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
        <DatePicker
          value={startDate}
          onChange={setStartDate}
          maximumDate={endDate}
          className="min-w-[120px]"
        />
      </View>
      
      <View className="flex-row items-center">
        <Text className="text-text mr-2">To:</Text>
        <DatePicker
          value={endDate}
          onChange={setEndDate}
          minimumDate={startDate}
          maximumDate={new Date()}
          className="min-w-[120px]"
        />
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
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      className="mb-4"
    >
      <TouchableOpacity 
        onPress={() => setActiveTab('characters')}
        className={`px-4 py-2 rounded-lg mr-2 ${activeTab === 'characters' ? 'bg-primary' : 'bg-surface'}`}
      >
        <Text className={activeTab === 'characters' ? 'text-white' : 'text-text'}>Character Distribution</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => setActiveTab('models')}
        className={`px-4 py-2 rounded-lg mr-2 ${activeTab === 'models' ? 'bg-primary' : 'bg-surface'}`}
      >
        <Text className={activeTab === 'models' ? 'text-white' : 'text-text'}>Model Distribution</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => setActiveTab('usage')}
        className={`px-4 py-2 rounded-lg mr-2 ${activeTab === 'usage' ? 'bg-primary' : 'bg-surface'}`}
      >
        <Text className={activeTab === 'usage' ? 'text-white' : 'text-text'}>Token Usage</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => setActiveTab('users')}
        className={`px-4 py-2 rounded-lg mr-2 ${activeTab === 'users' ? 'bg-primary' : 'bg-surface'}`}
      >
        <Text className={activeTab === 'users' ? 'text-white' : 'text-text'}>User Engagement</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => setActiveTab('performance')}
        className={`px-4 py-2 rounded-lg ${activeTab === 'performance' ? 'bg-primary' : 'bg-surface'}`}
      >
        <Text className={activeTab === 'performance' ? 'text-white' : 'text-text'}>Performance</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSummary = () => {
    const totalTokens = statistics.reduce((sum, stat) => sum + stat.totalTokens, 0);
    const totalPromptTokens = statistics.reduce((sum, stat) => sum + stat.promptTokens, 0);
    const totalCompletionTokens = statistics.reduce((sum, stat) => sum + stat.completionTokens, 0);
    const totalRequests = statistics.length;
    const avgDuration = statistics.length > 0 
      ? statistics.reduce((sum, stat) => sum + stat.duration, 0) / statistics.length / 1000 
      : 0;
    
    // Mock data for additional metrics
    const activeUsers = 325;
    const costEstimate = (totalTokens * 0.000002).toFixed(2); // Simplified cost calculation
    
    return (
      <View className={`flex-row flex-wrap justify-between mb-6`}>
        <View className="bg-surface p-4 rounded-lg flex-1 mr-2 mb-2 min-w-[150px]">
          <Text className="text-secondary text-sm">Total Tokens</Text>
          <Text className="text-primary text-xl font-bold">{totalTokens.toLocaleString()}</Text>
        </View>
        
        <View className="bg-surface p-4 rounded-lg flex-1 mr-2 mb-2 min-w-[150px]">
          <Text className="text-secondary text-sm">Total Requests</Text>
          <Text className="text-primary text-xl font-bold">{totalRequests.toLocaleString()}</Text>
        </View>
        
        <View className="bg-surface p-4 rounded-lg flex-1 mb-2 min-w-[150px] mr-2">
          <Text className="text-secondary text-sm">Avg Response Time</Text>
          <Text className="text-primary text-xl font-bold">{avgDuration.toFixed(2)}s</Text>
        </View>

        <View className="bg-surface p-4 rounded-lg flex-1 mr-2 mb-2 min-w-[150px]">
          <Text className="text-secondary text-sm">Active Users</Text>
          <Text className="text-primary text-xl font-bold">{activeUsers}</Text>
        </View>
        
        <View className="bg-surface p-4 rounded-lg flex-1 mb-2 min-w-[150px]">
          <Text className="text-secondary text-sm">Est. Cost ($)</Text>
          <Text className="text-primary text-xl font-bold">${costEstimate}</Text>
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

  const renderModelDistributionChart = () => {

    const modelData = prepareModelData();
    
    // Calculate percentages for the pie chart
    const totalTokens = modelData.reduce((sum, model) => sum + model.tokens, 0);
    const chartData = modelData.map(model => ({
      name: model.name,
      population: model.tokens,
      color: model.color,
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    }));
    
    return (
      <View className="bg-surface p-4 rounded-lg mb-6">
        <Text className="text-text font-bold mb-4">Model Distribution by Token Usage</Text>
        <View className="items-center">
          <PieChart
            data={chartData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute={false}
          />
        </View>
        
        <View className="mt-6">
          <Text className="text-text font-bold mb-2">Model Usage Breakdown</Text>
          {modelData.map((model, index) => (
            <View key={index} className="flex-row justify-between items-center mb-2 p-2 bg-background/30 rounded-lg">
              <View className="flex-row items-center">
                <View style={{ width: 12, height: 12, backgroundColor: model.color, borderRadius: 6, marginRight: 8 }} />
                <Text className="text-text">{model.name}</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-secondary mr-2">{model.tokens.toLocaleString()} tokens</Text>
                <Text className="text-primary">({((model.tokens / totalTokens) * 100).toFixed(1)}%)</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderCharacterDistributionChart = () => {

    const characterData = prepareCharacterData();

    // Calculate percentages for the pie chart
    const totalTokens = characterData.reduce((sum, character) => sum + character.tokens, 0);
    const chartData = characterData.map(character => ({
      name: character.name,
      population: character.tokens,
      color: character.color,
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    }));
    
    return (
      <View className="bg-surface p-4 rounded-lg mb-6">
        <Text className="text-text font-bold mb-4">Character Distribution by Token Usage</Text>
        <View className="items-center">
          <PieChart
            data={chartData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute={false}
          />
        </View>
        
        <View className="mt-6">
          <Text className="text-text font-bold mb-2">Character Usage Breakdown</Text>
          {characterData.map((character, index) => (
            <View key={index} className="flex-row justify-between items-center mb-2 p-2 bg-background/30 rounded-lg">
              <View className="flex-row items-center">
                <View style={{ width: 12, height: 12, backgroundColor: character.color, borderRadius: 6, marginRight: 8 }} />
                <Text className="text-text">{character.name}</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-secondary mr-2">{character.tokens.toLocaleString()} tokens</Text>
                <Text className="text-primary">({((character.tokens / totalTokens) * 100).toFixed(1)}%)</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderUserEngagementChart = () => {
    const userData = getMockUserEngagement();
    
    // Additional mock data for user metrics
    const userMetrics = {
      avgSessionsPerUser: 3.7,
      avgMessagesPerSession: 12.5,
      retentionRate: 78.5,
      newUsers: 42
    };
    
    return (
      <View className="bg-surface p-4 rounded-lg mb-6">
        <Text className="text-text font-bold mb-4">Daily Active Users</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={userData}
            width={Math.max(screenWidth, userData.labels.length * 50)}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 16 }}
          />
        </ScrollView>
        
        <View className={`mt-6 flex-row flex-wrap justify-between`}>
          <View className="bg-background/30 p-3 rounded-lg mb-2 min-w-[150px] flex-1 mr-2">
            <Text className="text-secondary text-xs">Avg Sessions/User</Text>
            <Text className="text-primary text-lg font-bold">{userMetrics.avgSessionsPerUser}</Text>
          </View>
          
          <View className="bg-background/30 p-3 rounded-lg mb-2 min-w-[150px] flex-1 mr-2">
            <Text className="text-secondary text-xs">Avg Messages/Session</Text>
            <Text className="text-primary text-lg font-bold">{userMetrics.avgMessagesPerSession}</Text>
          </View>
          
          <View className="bg-background/30 p-3 rounded-lg mb-2 min-w-[150px] flex-1">
            <Text className="text-secondary text-xs">Retention Rate</Text>
            <Text className="text-primary text-lg font-bold">{userMetrics.retentionRate}%</Text>
          </View>
          
          <View className="bg-background/30 p-3 rounded-lg mb-2 min-w-[150px] flex-1">
            <Text className="text-secondary text-xs">New Users (30d)</Text>
            <Text className="text-primary text-lg font-bold">{userMetrics.newUsers}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPerformanceMetricsChart = () => {
    const performanceData = getMockPerformanceMetrics();
    
    // Additional mock data for performance metrics
    const errorRates = {
      "GPT-4": 0.8,
      "Claude 3": 0.5,
      "Llama 3": 1.2,
      "Mistral": 1.5,
      "GPT-3.5": 0.7
    };
    
    const uptimePercentages = {
      "GPT-4": 99.7,
      "Claude 3": 99.9,
      "Llama 3": 98.5,
      "Mistral": 99.2,
      "GPT-3.5": 99.8
    };
    
    return (
      <View className="bg-surface p-4 rounded-lg mb-6">
        <Text className="text-text font-bold mb-4">Average Response Time by Model (seconds)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="rounded-xl">
          <BarChart
            data={performanceData}
            width={Math.max(1000, performanceData.labels.length * 60)}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(50, 205, 50, ${opacity})`,
              style:{
                borderRadius: 16               
              },
            }}
            
            fromZero
            showValuesOnTopOfBars
            yAxisLabel=""
            yAxisSuffix="s"
          />
        </ScrollView>
        
        <View className="mt-6">
          <Text className="text-text font-bold mb-2">Model Performance Metrics</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              <View className="mr-4">
                <Text className="text-secondary mb-2">Model</Text>
                {Object.keys(errorRates).map((model, index) => (
                  <Text key={index} className="text-text py-2">{model}</Text>
                ))}
              </View>
              
              <View className="mr-4">
                <Text className="text-secondary mb-2">Error Rate (%)</Text>
                {Object.values(errorRates).map((rate, index) => (
                  <Text key={index} className="text-text py-2">{rate.toFixed(1)}%</Text>
                ))}
              </View>
              
              <View className="mr-4">
                <Text className="text-secondary mb-2">Uptime (%)</Text>
                {Object.values(uptimePercentages).map((uptime, index) => (
                  <Text key={index} className="text-text py-2">{uptime.toFixed(1)}%</Text>
                ))}
              </View>
              
              <View>
                <Text className="text-secondary mb-2">Response Time (s)</Text>
                {performanceData.datasets[0].data.map((time, index) => (
                  <Text key={index} className="text-text py-2">{time.toFixed(1)}s</Text>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <Ionicons
              name="stats-chart"
              size={32}
              className="!text-primary mr-2"
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
            {activeTab === 'models' && renderModelDistributionChart()}
            {activeTab === 'characters' && renderCharacterDistributionChart()}
            {activeTab === 'users' && renderUserEngagementChart()}
            {activeTab === 'performance' && renderPerformanceMetricsChart()}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 