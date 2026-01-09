import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/useToast";
import { Plus, MoreHorizontal, Edit, Trash2, Search, Users, UserPlus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  createClient,
  listClients,
  getClient,
  updateClient,
  deleteClient,
  impersonateClient,
  type ClientData,
} from "@/services/adminClientService";

export default function ClientsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);

  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [page, setPage] = useState(1);
  const [limit] = useState(1000);
  const [total, setTotal] = useState(0);

  const [clients, setClients] = useState<ClientData[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const res = await listClients((page - 1) * limit, limit);
        setClients(res.data);
        setTotal(res.data.length);
      } catch (error) {
        toast.error("Unable to load clients");
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, [page, limit, toast]);

  const filteredClients = Array.isArray(clients)
    ? clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    : [];

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (selectedClient) {
        await updateClient(selectedClient.id, clientData);
        toast.success(`\${clientData.name} was updated successfully`);
      } else {
        await createClient({ ...clientData, password: clientData.password || "Password@123" });
        toast.success(`\${clientData.name} was added successfully`);
      }
      setIsDialogOpen(false);
      resetForm();
      const res = await listClients((page - 1) * limit, limit);
      setClients(res.data);
      setTotal(res.data.length);
    } catch (error) {
      toast.error("Unable to save client. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClient = async (client: ClientData) => {
    setIsLoading(true);
    try {
      const res = await getClient(client.id);
      setSelectedClient(res.data);
      setClientData({
        name: res.data.name,
        email: res.data.email,
        password: "",
      });
      setIsDialogOpen(true);
    } catch (error) {
      toast.error("Unable to search client");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteClient = async () => {
    if (!selectedClient) return;
    setIsLoading(true);
    try {
      await deleteClient(selectedClient.id);
      toast.success(`\${selectedClient.name} was deleted successfully`);
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
      const res = await listClients((page - 1) * limit, limit);
      setClients(res.data);
      setTotal(res.data.length);
    } catch (error) {
      toast.error("Unable to delete client. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImpersonateClient = async (client: ClientData) => {
    setIsLoading(true);
    try {
      // Backend will set the HttpOnly cookie automatically
      await impersonateClient(client.id);

      // Store impersonation state in localStorage for UI feedback
      localStorage.setItem("isImpersonating", "true");
      localStorage.setItem("impersonatedClient", client.name);

      toast.success(`You are now viewing as ${client.name}`);

      // Force full page reload to refresh AuthContext with new cookie
      window.location.replace("/agents");
    } catch (error) {
      console.error("Error impersonating client:", error);
      toast.error("Unable to impersonate client");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setClientData({
      name: "",
      email: "",
      password: "",
    });
    setSelectedClient(null);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#f8f8f2]">Client Management</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-[#bd93f9] text-[#0b0b11] hover:bg-[#bd93f9]/80">
              <Plus className="mr-2 h-4 w-4" />
              New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-[#1a1b26] border-[#282a36]">
            <form onSubmit={handleAddClient}>
              <DialogHeader>
                <DialogTitle className="text-[#f8f8f2]">{selectedClient ? "Edit Client" : "Create New Client"}</DialogTitle>
                <DialogDescription className="text-[#6272a4]">
                  {selectedClient
                    ? "Edit the existing client information."
                    : "Fill in the information to create a new client."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#f8f8f2]">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={clientData.name}
                    onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                    className="bg-[#282a36] border-[#44475a] text-[#f8f8f2]"
                    placeholder="Company name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#f8f8f2]">
                    Email / Username
                  </Label>
                  <Input
                    id="email"
                    type="text"
                    value={clientData.email}
                    onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                    className="bg-[#282a36] border-[#44475a] text-[#f8f8f2]"
                    placeholder="contact@company.com or username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#f8f8f2]">
                    Password {selectedClient && "(Optional for updates)"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={clientData.password}
                    onChange={(e) => setClientData({ ...clientData, password: e.target.value })}
                    className="bg-[#282a36] border-[#44475a] text-[#f8f8f2]"
                    placeholder={selectedClient ? "Enter new password to change" : "Enter password"}
                    required={!selectedClient}
                    minLength={8}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-[#44475a] text-[#f8f8f2] hover:bg-[#282a36]"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#bd93f9] text-[#0b0b11] hover:bg-[#bd93f9]/80" disabled={isLoading}>
                  {isLoading ? "Saving..." : selectedClient ? "Save Changes" : "Add Client"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-[#1a1b26] border-[#282a36] text-[#f8f8f2]">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm delete</AlertDialogTitle>
              <AlertDialogDescription className="text-[#6272a4]">
                Are you sure you want to delete the client "{selectedClient?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-[#44475a] text-[#f8f8f2] hover:bg-[#282a36]">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteClient}
                className="bg-[#ff5555] text-[#f8f8f2] hover:bg-[#ff5555]/80"
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card className="bg-[#1a1b26] border-[#282a36] mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#f8f8f2] text-lg">Search Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6272a4]" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#282a36] border-[#44475a] text-[#f8f8f2] pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1b26] border-[#282a36]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#282a36] hover:bg-[#282a36]">
                <TableHead className="text-[#f8f8f2]">Name</TableHead>
                <TableHead className="text-[#f8f8f2]">Email</TableHead>
                <TableHead className="text-[#f8f8f2]">Created At</TableHead>
                <TableHead className="text-[#f8f8f2]">Users</TableHead>
                <TableHead className="text-[#f8f8f2]">Agents</TableHead>
                <TableHead className="text-[#f8f8f2] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id} className="border-[#282a36] hover:bg-[#282a36]/50">
                    <TableCell className="font-medium text-[#f8f8f2]">{client.name}</TableCell>
                    <TableCell className="text-[#6272a4]">{client.email}</TableCell>
                    <TableCell className="text-[#6272a4]">
                      {new Date(client.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-[#6272a4]">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-[#bd93f9]" />
                        {client.users_count ?? 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-[#6272a4]">{client.agents_count ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-[#f8f8f2] hover:bg-[#282a36]">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#282a36] border-[#44475a] text-[#f8f8f2]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-[#44475a]" />
                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-[#44475a]"
                            onClick={() => handleEditClient(client)}
                          >
                            <Edit className="mr-2 h-4 w-4 text-[#bd93f9]" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-[#44475a]"
                            onClick={() => handleImpersonateClient(client)}
                          >
                            <UserPlus className="mr-2 h-4 w-4 text-[#bd93f9]" />
                            Enter as client
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-[#44475a] text-[#ff5555]"
                            onClick={() => {
                              setSelectedClient(client);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-[#6272a4]">
                    No clients found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end mt-4">
        <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || isLoading}>
          Previous
        </Button>
        <span className="mx-4 text-[#f8f8f2]">Page {page} of {Math.ceil(total / limit) || 1}</span>
        <Button onClick={() => setPage((p) => p + 1)} disabled={page * limit >= total || isLoading}>
          Next
        </Button>
      </div>
    </div>
  );
}
