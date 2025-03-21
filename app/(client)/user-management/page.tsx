'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { createUser, createCustomer } from '@/lib/api-calls';
import { getAuthToken } from '@/lib/helper-function';
import { Plus, UserRound, Users, Loader2, Search, RefreshCw } from 'lucide-react';

// Form schemas
const createUserSchema = z.object({
  Email: z.string().email('Please enter a valid email'),
  full_name: z.string().min(3, 'Full name must be at least 3 characters'),
  Password: z.string().min(8, 'Password must be at least 8 characters'),
  organization_name: z.string().min(1, 'Organization name is required')
});

const createCustomerSchema = z.object({
  First_name: z.string().min(1, 'First name is required'),
  Last_name: z.string().min(1, 'Last name is required'),
  Email: z.string().email('Please enter a valid email'),
  Phone_number: z.string().optional(),
  Password: z.string().min(8, 'Password must be at least 8 characters'),
  Customer_type: z.string().min(1, 'Customer type is required')
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type CreateCustomerFormValues = z.infer<typeof createCustomerSchema>;

// Mock data for demonstration
const mockUserData = {
  data: {
    id: '123',
    email: 'john@example.com',
    full_name: 'John Doe',
    organization: {
      name: 'Example Corp',
      id: '456'
    },
    status: 'Active',
    created_at: new Date().toISOString()
  }
};

const mockCustomerData = {
  data: {
    id: '789',
    email: 'alice@example.com',
    first_name: 'Alice',
    last_name: 'Johnson',
    phone_number: '+1234567890',
    customer_type: 'Individual',
    kyc_tier: 'Tier 1',
    created_at: new Date().toISOString()
  }
};

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  // Fetch user data if a userId is set
  const { 
    data: userData, 
    isLoading: isLoadingUser, 
    error: userError,
    isError: isUserError
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Return mock data for demonstration
      return mockUserData;
      
      // Uncomment below and remove the mock data line above if getSingleUser function exists
      /*
      const token = getAuthToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await getSingleUser({ user_id: userId, token });
      if (response.error) throw new Error(response.error.message);
      return response.data;
      */
    },
    enabled: !!userId
  });

  // Fetch customer data if a customerId is set
  const { 
    data: customerData, 
    isLoading: isLoadingCustomer, 
    error: customerError,
    isError: isCustomerError
  } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      
      // Return mock data for demonstration
      return mockCustomerData;
      
      // Uncomment below and remove the mock data line above if getSingleCustomer function exists
      /*
      const token = getAuthToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await getSingleCustomer({ customer_id: customerId, token });
      if (response.error) throw new Error(response.error.message);
      return response.data;
      */
    },
    enabled: !!customerId
  });

  // Form setup for creating a user
  const userForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      Email: '',
      full_name: '',
      Password: '',
      organization_name: ''
    }
  });

  // Form setup for creating a customer
  const customerForm = useForm<CreateCustomerFormValues>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      First_name: '',
      Last_name: '',
      Email: '',
      Phone_number: '',
      Password: '',
      Customer_type: 'Individual'
    }
  });

  // Mutation for creating a user
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserFormValues) => {
      const token = getAuthToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await createUser({ ...data, token });
      if (response.error) throw new Error(response.error.message);
      if (response.validationErrors && response.validationErrors.length > 0) {
        throw new Error(response.validationErrors[0].message);
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success('User created successfully');
      setOpenUserDialog(false);
      userForm.reset();
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create user');
      }
    }
  });

  // Mutation for creating a customer
  const createCustomerMutation = useMutation({
    mutationFn: async (data: CreateCustomerFormValues) => {
      const response = await createCustomer(data);
      if (response.error) throw new Error(response.error.message);
      if (response.validationErrors && response.validationErrors.length > 0) {
        throw new Error(response.validationErrors[0].message);
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success('Customer created successfully');
      setOpenCustomerDialog(false);
      customerForm.reset();
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create customer');
      }
    }
  });

  // Handle user form submission
  const onSubmitUserForm = (data: CreateUserFormValues) => {
    createUserMutation.mutate(data);
  };

  // Handle customer form submission
  const onSubmitCustomerForm = (data: CreateCustomerFormValues) => {
    createCustomerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 bg-clip-text text-transparent">
            User Management
          </h1>
          <div className="space-x-2">
            <Dialog open={openUserDialog} onOpenChange={setOpenUserDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  <span>Add User</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Add a new user with administrative permissions
                  </DialogDescription>
                </DialogHeader>
                <Form {...userForm}>
                  <form onSubmit={userForm.handleSubmit(onSubmitUserForm)} className="space-y-4">
                    <FormField
                      control={userForm.control}
                      name="Email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="user@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={userForm.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={userForm.control}
                      name="Password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="********" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={userForm.control}
                      name="organization_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization</FormLabel>
                          <FormControl>
                            <Input placeholder="Company Ltd." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button 
                        type="submit"
                        disabled={createUserMutation.isPending}
                        className="w-full"
                      >
                        {createUserMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : 'Create User'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={openCustomerDialog} onOpenChange={setOpenCustomerDialog}>
              <DialogTrigger asChild>
                <Button variant="default" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Customer</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Customer</DialogTitle>
                  <DialogDescription>
                    Add a new customer to the platform
                  </DialogDescription>
                </DialogHeader>
                <Form {...customerForm}>
                  <form onSubmit={customerForm.handleSubmit(onSubmitCustomerForm)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={customerForm.control}
                        name="First_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={customerForm.control}
                        name="Last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={customerForm.control}
                      name="Email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="customer@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={customerForm.control}
                      name="Phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={customerForm.control}
                      name="Password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="********" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={customerForm.control}
                      name="Customer_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Individual">Individual</SelectItem>
                              <SelectItem value="Business">Business</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button 
                        type="submit"
                        disabled={createCustomerMutation.isPending}
                        className="w-full"
                      >
                        {createCustomerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : 'Create Customer'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search by name or email..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Tabs 
          value={selectedTab} 
          onValueChange={setSelectedTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Customers
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Users</CardTitle>
                <CardDescription>
                  Manage users with administrative access to the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* This would normally be populated from an API */}
                    <TableRow>
                      <TableCell className="font-medium">John Doe</TableCell>
                      <TableCell>john@example.com</TableCell>
                      <TableCell>Example Corp</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
                          Active
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setUserId('123')}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Jane Smith</TableCell>
                      <TableCell>jane@example.com</TableCell>
                      <TableCell>Example Corp</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400">
                          Pending
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setUserId('456')}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </CardFooter>
            </Card>

            {/* User Details */}
            {userId && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>User Details</CardTitle>
                    <CardDescription>
                      Detailed information about the selected user
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['user', userId] })}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingUser ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : isUserError ? (
                    <Alert>
                      <AlertDescription>
                        {userError instanceof Error ? userError.message : 'Failed to load user data'}
                      </AlertDescription>
                    </Alert>
                  ) : userData ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</h3>
                          <p className="mt-1 text-sm">{userData.data.full_name}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                          <p className="mt-1 text-sm">{userData.data.email}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Organization</h3>
                          <p className="mt-1 text-sm">{userData.data.organization?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                          <p className="mt-1 text-sm">{userData.data.status || 'Active'}</p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</h3>
                        <p className="mt-1 text-sm">
                          {new Date(userData.data.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      Select a user to view details
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customers</CardTitle>
                <CardDescription>
                  View and manage your customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* This would normally be populated from an API */}
                    <TableRow>
                      <TableCell className="font-medium">Alice Johnson</TableCell>
                      <TableCell>alice@example.com</TableCell>
                      <TableCell>Individual</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
                          Active
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setCustomerId('789')}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Bob Williams</TableCell>
                      <TableCell>bob@example.com</TableCell>
                      <TableCell>Business</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
                          Active
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setCustomerId('101')}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </CardFooter>
            </Card>

            {/* Customer Details */}
            {customerId && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Customer Details</CardTitle>
                    <CardDescription>
                      Detailed information about the selected customer
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['customer', customerId] })}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingCustomer ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : isCustomerError ? (
                    <Alert>
                      <AlertDescription>
                        {customerError instanceof Error ? customerError.message : 'Failed to load customer data'}
                      </AlertDescription>
                    </Alert>
                  ) : customerData ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</h3>
                          <p className="mt-1 text-sm">{customerData.data.first_name} {customerData.data.last_name}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                          <p className="mt-1 text-sm">{customerData.data.email}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</h3>
                          <p className="mt-1 text-sm">{customerData.data.phone_number || 'N/A'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</h3>
                          <p className="mt-1 text-sm">{customerData.data.customer_type}</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</h3>
                          <p className="mt-1 text-sm">
                            {new Date(customerData.data.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">KYC Status</h3>
                          <p className="mt-1 text-sm">{customerData.data.kyc_tier || 'Not Verified'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      Select a customer to view details
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 