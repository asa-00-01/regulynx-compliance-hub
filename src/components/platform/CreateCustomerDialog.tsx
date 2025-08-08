
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { usePlatformRoles } from '@/hooks/usePlatformRoles';
import { Customer } from '@/types/platform-roles';

interface CreateCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CustomerFormData {
  name: string;
  domain: string;
  subscription_tier: string;
}

export function CreateCustomerDialog({ open, onOpenChange }: CreateCustomerDialogProps) {
  const { createCustomer, isCreatingCustomer } = usePlatformRoles();
  const { register, handleSubmit, reset, setValue, watch } = useForm<CustomerFormData>({
    defaultValues: {
      name: '',
      domain: '',
      subscription_tier: 'basic',
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      await createCustomer({
        name: data.name,
        domain: data.domain || null,
        subscription_tier: data.subscription_tier,
        settings: { userCount: 0 },
      });
      
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create customer:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
          <DialogDescription>
            Add a new customer organization to the platform.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Customer Name</Label>
            <Input
              id="name"
              {...register('name', { required: true })}
              placeholder="Enter customer name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domain (Optional)</Label>
            <Input
              id="domain"
              {...register('domain')}
              placeholder="example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subscription_tier">Subscription Tier</Label>
            <Select 
              value={watch('subscription_tier')} 
              onValueChange={(value) => setValue('subscription_tier', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subscription tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreatingCustomer}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingCustomer}>
              {isCreatingCustomer ? 'Creating...' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
