import React from 'react';
import { Users, UserCheck, Clock, Ban } from 'lucide-react';
import type { LeadStats } from '../types/lead';

interface DashboardStatsProps {
  stats: LeadStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Total Leads',
      value: stats.total,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Pending Follow-ups',
      value: stats.total-stats.followUp,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Converted',
      value: stats.converted,
      icon: UserCheck,
      color: 'bg-green-500',
    },
    {
      title: 'Lost',
      value: stats.notInterested,
      icon: Ban,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => (
        <div key={stat.title} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
          </div>
          <h3 className="text-gray-600 font-medium">{stat.title}</h3>
        </div>
      ))}
    </div>
  );
}