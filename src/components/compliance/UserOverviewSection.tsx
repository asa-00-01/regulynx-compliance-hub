
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Users } from 'lucide-react';
import { useCompliance } from '@/context/ComplianceContext';
import UserCard from '@/components/user/UserCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const UserOverviewSection: React.FC = () => {
  const { state } = useCompliance();
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter users based on search and risk filter
  const filteredUsers = state.users.filter(user => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Risk filter
    let matchesRisk = true;
    if (riskFilter === 'high') {
      matchesRisk = user.riskScore >= 75;
    } else if (riskFilter === 'medium') {
      matchesRisk = user.riskScore >= 50 && user.riskScore < 75;
    } else if (riskFilter === 'low') {
      matchesRisk = user.riskScore < 50;
    }
    
    // Tab filter
    if (activeTab === 'pep') {
      return matchesSearch && matchesRisk && user.isPEP;
    } else if (activeTab === 'sanctioned') {
      return matchesSearch && matchesRisk && user.isSanctioned;
    } else if (activeTab === 'high-risk') {
      return matchesSearch && matchesRisk && user.riskScore >= 75;
    } else if (activeTab === 'with-cases') {
      return matchesSearch && matchesRisk && user.complianceCases.length > 0;
    }
    
    return matchesSearch && matchesRisk;
  });
  
  const pepCount = state.users.filter(user => user.isPEP).length;
  const sanctionedCount = state.users.filter(user => user.isSanctioned).length;
  const highRiskCount = state.users.filter(user => user.riskScore >= 75).length;
  const withCasesCount = state.users.filter(user => user.complianceCases.length > 0).length;
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5" /> User Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <option value="all">All Risk Levels</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setRiskFilter('all');
              }}>
                Reset
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-5">
              <TabsTrigger value="all">
                All Users 
                <Badge variant="outline" className="ml-2">{state.users.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pep">
                PEP
                <Badge variant="outline" className="ml-2">{pepCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="sanctioned">
                Sanctioned
                <Badge variant="outline" className="ml-2">{sanctionedCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="high-risk">
                High Risk
                <Badge variant="outline" className="ml-2">{highRiskCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="with-cases">
                With Cases
                <Badge variant="outline" className="ml-2">{withCasesCount}</Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">No users found matching your criteria.</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => {
                        setSearchQuery('');
                        setRiskFilter('all');
                        setActiveTab('all');
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  filteredUsers.map(user => (
                    <UserCard key={user.id} userId={user.id} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserOverviewSection;
