
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AMLTransaction, HIGH_RISK_COUNTRIES } from '@/types/aml';

interface TransactionCountriesProps {
  transaction: AMLTransaction;
}

const TransactionCountries: React.FC<TransactionCountriesProps> = ({ transaction }) => {
  const isHighRiskCountry = (countryCode: string) => {
    return HIGH_RISK_COUNTRIES.some(country => 
      country.countryCode === countryCode && 
      country.riskLevel === 'high'
    );
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-2">Countries</h3>
        <dl className="space-y-3">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-muted-foreground">Sender Country</dt>
            <dd className="flex items-center gap-2">
              <span className="text-sm font-medium">{transaction.senderCountryCode}</span>
              {isHighRiskCountry(transaction.senderCountryCode) && (
                <Badge variant="destructive">High-Risk</Badge>
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-muted-foreground">Receiver Country</dt>
            <dd className="flex items-center gap-2">
              <span className="text-sm font-medium">{transaction.receiverCountryCode}</span>
              {isHighRiskCountry(transaction.receiverCountryCode) && (
                <Badge variant="destructive">High-Risk</Badge>
              )}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

export default TransactionCountries;
