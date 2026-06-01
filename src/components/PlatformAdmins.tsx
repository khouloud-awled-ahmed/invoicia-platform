import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Plus, Search, Shield, Edit, Trash2, UserPlus, ShieldCheck, Mail, Calendar, Clock } from "lucide-react";
import { MOCK_PLATFORM_USERS, PlatformUser } from "../lib/platform-data";

export function PlatformAdmins() {
  const [users, setUsers] = useState(MOCK_PLATFORM_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<PlatformUser | null>(null);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (user: PlatformUser) => {
    setEditingUser(user);
    setShowDialog(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setShowDialog(true);
  };

  const handleDelete = (user: PlatformUser) => {
    setDeletingUser(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deletingUser) {
      setUsers(users.filter(u => u.id !== deletingUser.id));
      setShowDeleteDialog(false);
      setDeletingUser(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      super_admin: "bg-purple-100 text-purple-800 border-purple-200",
      platform_admin: "bg-blue-100 text-blue-800 border-blue-200",
      support: "bg-green-100 text-green-800 border-green-200",
    };

    const labels = {
      super_admin: "Super Admin",
      platform_admin: "Admin Plateforme",
      support: "Support",
    };

    const icons = {
      super_admin: ShieldCheck,
      platform_admin: Shield,
      support: Mail,
    };

    const Icon = icons[role as keyof typeof icons];

    return (
      <Badge className={styles[role as keyof typeof styles]} variant="outline">
        <Icon className="w-3 h-3 mr-1" />
        {labels[role as keyof typeof labels]}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800">Actif</Badge>
    ) : (
      <Badge variant="secondary">Inactif</Badge>
    );
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-tight">Administrateurs de la Plateforme</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les utilisateurs ayant accès au panneau d'administration
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvel Administrateur
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Administrateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.status === "active").length} actifs
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Super Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {users.filter(u => u.role === "super_admin").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Accès complet à la plateforme
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Équipe Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {users.filter(u => u.role === "support").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Assistance clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recherche et Filtres */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2">
                        {user.role === "super_admin" && (
                          <ShieldCheck className="h-4 w-4 text-purple-600" />
                        )}
                        <span>{user.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {new Date(user.lastLogin).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Jamais</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.role !== "super_admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Création/Édition */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Modifier l'Administrateur" : "Nouvel Administrateur"}
            </DialogTitle>
            <DialogDescription>
              Ajoutez ou modifiez les informations de l'administrateur plateforme
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Nom complet *</Label>
              <Input
                id="admin-name"
                placeholder="Jean Dupont"
                defaultValue={editingUser?.name}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-email">Email *</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="jean.dupont@invoicia.fr"
                defaultValue={editingUser?.email}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-role">Rôle *</Label>
              <Select defaultValue={editingUser?.role || "support"}>
                <SelectTrigger id="admin-role">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Super Admin - Accès complet</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="platform_admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Admin Plateforme - Gestion quotidienne</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="support">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>Support - Assistance clients</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-status">Statut</Label>
              <Select defaultValue={editingUser?.status || "active"}>
                <SelectTrigger id="admin-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              {editingUser ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmation Suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'administrateur{" "}
              <span className="font-semibold">{deletingUser?.name}</span> ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}