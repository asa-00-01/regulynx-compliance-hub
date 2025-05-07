
import React from 'react';
import { SAR } from '@/types/sar';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { mockUsers, mockAvailableTransactions } from './mockSARData';

const formSchema = z.object({
  userId: z.string().nonempty('User is required'),
  dateOfActivity: z.string().nonempty('Date is required'),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  transactions: z.array(z.string()).min(1, 'At least one transaction must be selected'),
  hasDocuments: z.boolean().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SARFormProps {
  initialData?: Partial<SAR>;
  onSubmit: (data: Omit<SAR, 'id'>, isDraft: boolean) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const SARForm: React.FC<SARFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}) => {
  // Initialize form with schema and default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: initialData?.userId || '',
      dateOfActivity: initialData?.dateOfActivity ? 
        new Date(initialData.dateOfActivity).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0],
      summary: initialData?.summary || '',
      transactions: initialData?.transactions || [],
      hasDocuments: initialData?.documents && initialData.documents.length > 0 || false,
      notes: initialData?.notes?.join('\n') || '',
    },
  });
  
  const handleSubmit = (values: FormValues, isDraft: boolean) => {
    const userName = mockUsers.find(user => user.id === values.userId)?.name || '';
    
    onSubmit({
      userId: values.userId,
      userName,
      dateSubmitted: new Date().toISOString(),
      dateOfActivity: new Date(values.dateOfActivity).toISOString(),
      status: isDraft ? 'draft' : 'submitted',
      summary: values.summary,
      transactions: values.transactions,
      documents: values.hasDocuments ? ['mock-document-1'] : undefined,
      notes: values.notes ? [values.notes] : undefined,
    }, isDraft);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {initialData?.id ? `Edit SAR: ${initialData.id}` : 'Create New Suspicious Activity Report'}
        </h2>
        <p className="text-muted-foreground">
          Complete all required fields to submit a new suspicious activity report
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject User</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfActivity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Suspicious Activity</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Summary of Suspicion</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe the suspicious activity in detail..." 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transactions"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel>Involved Transactions</FormLabel>
                  <FormDescription>
                    Select all transactions related to this suspicious activity
                  </FormDescription>
                </div>
                {mockAvailableTransactions.map((transaction) => (
                  <FormField
                    key={transaction.id}
                    control={form.control}
                    name="transactions"
                    render={({ field }) => {
                      return (
                        <FormItem key={transaction.id} className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(transaction.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, transaction.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== transaction.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {transaction.id}: {transaction.description}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hasDocuments"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Supporting Documents
                  </FormLabel>
                  <FormDescription>
                    Check if you have supporting documents to upload
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {form.watch("hasDocuments") && (
            <FormItem>
              <FormLabel>Upload Documents</FormLabel>
              <FormControl>
                <Input type="file" multiple disabled={isSubmitting} />
              </FormControl>
              <FormDescription>
                Document uploads are mocked in this frontend implementation
              </FormDescription>
            </FormItem>
          )}

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any additional information or context..." 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => form.handleSubmit((values) => handleSubmit(values, true))()}
              disabled={isSubmitting}
            >
              Save Draft
            </Button>
            <Button 
              onClick={() => form.handleSubmit((values) => handleSubmit(values, false))()}
              disabled={isSubmitting}
            >
              Submit SAR
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SARForm;
