import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { apiClient } from "../lib/api-client-backend";
import { toast } from "sonner";
import { Building2, Users, Plus, Trash2, Loader2, Download, FileText } from "lucide-react";

// Schéma de validation Zod pour les paramètres de paie
const payrollSettingsSchema = z.object({
  siret: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{14}$/.test(val),
      "Le SIRET doit contenir exactement 14 chiffres"
    ),
  nic: z.string().optional(),
  apeCode: z.string().optional(),
  conventionCollectiveCode: z.string().optional(),
  urssafId: z.string().optional(),
  dsnSenderId: z.string().optional(),
});

type PayrollSettingsFormData = z.infer<typeof payrollSettingsSchema>;

interface SocialOrg {
  _id?: string;
  id?: string;
  name: string;
  type: string;
  contractId?: string;
  affiliationId?: string;
  tenantId: string;
}

const socialOrgSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  type: z.string().min(1, "Le type est requis"),
  contractId: z.string().optional(),
  affiliationId: z.string().optional(),
});

type SocialOrgFormData = z.infer<typeof socialOrgSchema>;

// Types d'organismes sociaux français réels
const ORGANISM_TYPES = [
  { value: 'URSSAF', label: 'URSSAF (Union de Recouvrement des cotisations de Sécurité Sociale et d\'Allocations Familiales)' },
  { value: 'DGFIP', label: 'DGFIP (Direction Générale des Finances Publiques / Prélèvement à la source)' },
  { value: 'POLE_EMPLOI', label: 'Pôle Emploi (France Travail)' },
  { value: 'AGIRC_ARRCO', label: 'AGIRC-ARRCO (Retraite Complémentaire)' },
  { value: 'PREVOYANCE', label: 'Prévoyance (Organisme de Prévoyance)' },
  { value: 'MUTUELLE', label: 'Mutuelle (Mutuelle Santé)' },
  { value: 'NET_ENTREPRISE', label: 'Net-Entreprise (Portail déclaratif)' },
] as const;

interface PayrollSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayrollSettingsModal({ open, onOpenChange }: PayrollSettingsModalProps) {
  const [payrollSettings, setPayrollSettings] = useState<PayrollSettingsFormData>({});
  const [socialOrgs, setSocialOrgs] = useState<SocialOrg[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDownloadingDSN, setIsDownloadingDSN] = useState(false);
  const [selectedOrgType, setSelectedOrgType] = useState<string>('');

  const form = useForm<PayrollSettingsFormData>({
    resolver: zodResolver(payrollSettingsSchema),
    defaultValues: {
      siret: "",
      nic: "",
      apeCode: "6201Z", // Valeur par défaut
      conventionCollectiveCode: "SYNTEC", // Valeur par défaut
      urssafId: "",
      dsnSenderId: "",
    },
  });

  const socialOrgForm = useForm<SocialOrgFormData>({
    resolver: zodResolver(socialOrgSchema),
    defaultValues: {
      name: "",
      type: "",
      contractId: "",
      affiliationId: "",
    },
  });

  // Charger les données quand la modale s'ouvre
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [settings, orgs] = await Promise.all([
        apiClient.getPayrollSettings(),
        apiClient.getSocialOrgs(),
      ]);

      setPayrollSettings(settings || {});
      form.reset({
        siret: settings?.siret || "",
        nic: settings?.nic || "",
        apeCode: settings?.apeCode || "6201Z", // Pré-remplir si vide
        conventionCollectiveCode: settings?.conventionCollectiveCode || "SYNTEC", // Pré-remplir si vide
        urssafId: settings?.urssafId || "",
        dsnSenderId: settings?.dsnSenderId || "",
      });

      // Normaliser les IDs
      const normalizedOrgs = Array.isArray(orgs)
        ? orgs.map((org: any) => ({
            ...org,
            id: org._id || org.id,
          }))
        : [];
      setSocialOrgs(normalizedOrgs);
    } catch (error: any) {
      console.error("Erreur lors du chargement des données:", error);
      const errorMessage = error?.message || "Erreur lors du chargement des données";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (data: PayrollSettingsFormData) => {
    setIsSaving(true);
    try {
      await apiClient.updatePayrollSettings(data);
      setPayrollSettings(data);
      toast.success("Paramètres de paie enregistrés avec succès");
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      const errorMessage = error?.message || "Erreur lors de la sauvegarde";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSocialOrg = async (data: SocialOrgFormData) => {
    try {
      const newOrg = await apiClient.createSocialOrg(data);
      const normalizedOrg = {
        ...newOrg,
        id: newOrg._id || newOrg.id,
      };
      setSocialOrgs([...socialOrgs, normalizedOrg]);
      setIsDialogOpen(false);
      socialOrgForm.reset();
      setSelectedOrgType('');
      toast.success("Organisme social créé avec succès");
    } catch (error: any) {
      console.error("Erreur lors de la création:", error);
      const errorMessage = error?.message || "Erreur lors de la création";
      toast.error(errorMessage);
    }
  };

  const handleDeleteSocialOrg = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet organisme social ?")) {
      return;
    }

    setIsDeleting(id);
    try {
      await apiClient.deleteSocialOrg(id);
      setSocialOrgs(socialOrgs.filter((org) => (org.id || org._id) !== id));
      toast.success("Organisme social supprimé avec succès");
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      const errorMessage = error?.message || "Erreur lors de la suppression";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDownloadTestDSN = async () => {
    setIsDownloadingDSN(true);
    try {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear());

      const blob = await apiClient.downloadTestDSN(month, year);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DSN_${year}${month}_test.dsn`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Fichier DSN généré !");
    } catch (error: any) {
      console.error("Erreur lors du téléchargement:", error);
      const errorMessage = error?.message || "Erreur lors de la génération du fichier DSN";
      toast.error(errorMessage);
    } finally {
      setIsDownloadingDSN(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Paramétrage DSN</DialogTitle>
          <DialogDescription>
            Configurez les paramètres de paie et les organismes sociaux pour la génération DSN
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Zone de Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Zone de Test
                </CardTitle>
                <CardDescription>
                  Testez la génération du fichier DSN avec les paramètres configurés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleDownloadTestDSN}
                  disabled={isDownloadingDSN}
                  variant="outline"
                >
                  {isDownloadingDSN ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Tester la génération DSN
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Le fichier DSN sera généré avec les paramètres actuels (SIRET, organismes sociaux, employés actifs)
                </p>
              </CardContent>
            </Card>

            <Tabs defaultValue="identity" className="space-y-6">
              <TabsList>
                <TabsTrigger value="identity">
                  <Building2 className="w-4 h-4 mr-2" />
                  Identité Légale
                </TabsTrigger>
                <TabsTrigger value="organizations">
                  <Users className="w-4 h-4 mr-2" />
                  Organismes
                </TabsTrigger>
              </TabsList>

              {/* Onglet Identité Légale */}
              <TabsContent value="identity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Identité Légale</CardTitle>
                    <CardDescription>
                      Configurez les informations légales nécessaires pour la paie
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(handleSaveSettings)}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="siret"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SIRET</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="12345678901234"
                                    maxLength={14}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\D/g, "");
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Numéro SIRET (14 chiffres)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="nic"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>NIC</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="12345" />
                                </FormControl>
                                <FormDescription>
                                  Numéro Interne de Classement
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="apeCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Code APE</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="6201Z" />
                                </FormControl>
                                <FormDescription>
                                  Code Activité Principale Exercée (par défaut: 6201Z)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="conventionCollectiveCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Code Convention Collective</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="SYNTEC" />
                                </FormControl>
                                <FormDescription>
                                  Code de la convention collective (par défaut: SYNTEC - IDCC 1486)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="urssafId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Identifiant URSSAF</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="URSSAF-123456" />
                                </FormControl>
                                <FormDescription>
                                  Identifiant URSSAF de l'entreprise
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="dsnSenderId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Identifiant Émetteur DSN</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="DSN-123456" />
                                </FormControl>
                                <FormDescription>
                                  Identifiant de l'émetteur pour la DSN
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => form.reset()}
                          >
                            Annuler
                          </Button>
                          <Button type="submit" disabled={isSaving}>
                            {isSaving && (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            Enregistrer
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Onglet Organismes */}
              <TabsContent value="organizations" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Organismes Sociaux</CardTitle>
                        <CardDescription>
                          Gérez les organismes sociaux associés à votre entreprise
                        </CardDescription>
                      </div>
                      <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un organisme
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {socialOrgs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucun organisme social configuré
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>ID Contrat</TableHead>
                            <TableHead>ID Affiliation</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {socialOrgs.map((org) => {
                            const orgId = org.id || org._id || "";
                            return (
                              <TableRow key={orgId}>
                                <TableCell className="font-medium">
                                  {org.name}
                                </TableCell>
                                <TableCell>{org.type}</TableCell>
                                <TableCell>{org.contractId || "-"}</TableCell>
                                <TableCell>{org.affiliationId || "-"}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSocialOrg(orgId)}
                                    disabled={isDeleting === orgId}
                                  >
                                    {isDeleting === orgId ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    )}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Dialog pour créer un organisme social */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un organisme social</DialogTitle>
              <DialogDescription>
                Remplissez les informations de l'organisme social
              </DialogDescription>
            </DialogHeader>
            <Form {...socialOrgForm}>
              <form
                onSubmit={socialOrgForm.handleSubmit(handleCreateSocialOrg)}
                className="space-y-4"
              >
                <FormField
                  control={socialOrgForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="URSSAF" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={socialOrgForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type d'organisme *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedOrgType(value);
                          // Pré-remplir le nom selon le type
                          const orgType = ORGANISM_TYPES.find(t => t.value === value);
                          if (orgType) {
                            socialOrgForm.setValue('name', orgType.label.split('(')[0].trim());
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type d'organisme" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ORGANISM_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={socialOrgForm.control}
                  name="affiliationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro Affiliation</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="AFF-123456" />
                      </FormControl>
                      <FormDescription>
                        Numéro d'affiliation à l'organisme
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedOrgType !== 'URSSAF' && (
                  <FormField
                    control={socialOrgForm.control}
                    name="contractId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Contrat</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="CONTRACT-123" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedOrgType === 'URSSAF' && (
                  <FormField
                    control={socialOrgForm.control}
                    name="contractId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code Délégataire</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Code délégataire URSSAF" />
                        </FormControl>
                        <FormDescription>
                          Code délégataire URSSAF (optionnel)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      socialOrgForm.reset();
                      setSelectedOrgType('');
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">Créer</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
