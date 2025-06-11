
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, User } from 'lucide-react';
import { useCompliance } from '@/context/ComplianceContext';

interface CustomerSelectorProps {
  selectedCustomerId?: string;
  onCustomerSelect: (customerId: string) => void;
  label?: string;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  selectedCustomerId,
  onCustomerSelect,
  label = "Select Customer"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { state } = useCompliance();

  const filteredCustomers = state.users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.includes(searchTerm)
  );

  const selectedCustomer = state.users.find(user => user.id === selectedCustomerId);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCustomerId} onValueChange={onCustomerSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a customer...">
              {selectedCustomer && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{selectedCustomer.fullName}</span>
                  <Badge variant="outline" className="ml-auto">
                    Risk: {selectedCustomer.riskScore}
                  </Badge>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {filteredCustomers.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                No customers found
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="font-medium">{customer.fullName}</span>
                      <span className="text-xs text-muted-foreground">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge 
                        variant={customer.riskScore > 70 ? "destructive" : customer.riskScore > 50 ? "secondary" : "default"}
                        className="text-xs"
                      >
                        {customer.riskScore}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {customer.kycStatus}
                      </Badge>
                    </div>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CustomerSelector;
