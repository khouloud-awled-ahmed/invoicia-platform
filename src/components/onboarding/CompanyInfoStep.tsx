import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface CompanyInfoStepProps {
  data: {
    address: {
      line1: string;
      line2: string;
      postalCode: string;
      city: string;
      country: string;
    };
    vatNumber: string;
    matriculeFiscal: string;
    registreCommerce?: string;
    affiliationCNSS?: string;
  };
  onUpdate: (data: CompanyInfoStepProps['data']) => void;
  onNext: () => void;
  onPrevious?: () => void;
}

export function CompanyInfoStep({ data, onUpdate, onNext, onPrevious }: CompanyInfoStepProps) {
  const handleChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      onUpdate({
        ...data,
        address: {
          ...data.address,
          [addressField]: value,
        },
      });
    } else {
      onUpdate({
        ...data,
        [field]: value,
      });
    }
  };

  const canProceed = data.address.line1 && data.address.postalCode && data.address.city && data.matriculeFiscal?.trim();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Informations de l'entreprise</h2>
        <p className="text-muted-foreground">
          Complétez les informations de facturation
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address-line1">Adresse ligne 1 *</Label>
          <Input
            id="address-line1"
            value={data.address.line1}
            onChange={(e) => handleChange('address.line1', e.target.value)}
            placeholder="123 Rue Example"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address-line2">Adresse ligne 2</Label>
          <Input
            id="address-line2"
            value={data.address.line2}
            onChange={(e) => handleChange('address.line2', e.target.value)}
            placeholder="Bâtiment A"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="address-postalCode">Code postal *</Label>
            <Input
              id="address-postalCode"
              value={data.address.postalCode}
              onChange={(e) => handleChange('address.postalCode', e.target.value)}
              placeholder="75001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address-city">Ville *</Label>
            <Input
              id="address-city"
              value={data.address.city}
              onChange={(e) => handleChange('address.city', e.target.value)}
              placeholder="Paris"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address-country">Pays *</Label>
            <Input
              id="address-country"
              value={data.address.country}
              onChange={(e) => handleChange('address.country', e.target.value)}
              placeholder="Tunisie"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="matriculeFiscal">Matricule Fiscal *</Label>
            <Input
              id="matriculeFiscal"
              value={data.matriculeFiscal}
              onChange={(e) => handleChange('matriculeFiscal', e.target.value)}
              placeholder="1234567/A/B/M/000"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registreCommerce">Registre de Commerce</Label>
              <Input
                id="registreCommerce"
                value={data.registreCommerce ?? ''}
                onChange={(e) => handleChange('registreCommerce', e.target.value)}
                placeholder="RC"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="affiliationCNSS">Affiliation CNSS (N° employeur 8 chiffres)</Label>
              <Input
                id="affiliationCNSS"
                value={data.affiliationCNSS ?? ''}
                onChange={(e) => handleChange('affiliationCNSS', e.target.value)}
                placeholder="12345678"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vatNumber">Numéro TVA</Label>
            <Input
              id="vatNumber"
              value={data.vatNumber}
              onChange={(e) => handleChange('vatNumber', e.target.value)}
              placeholder="TVA Tunisie"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        {onPrevious && (
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>
        )}
        <Button onClick={onNext} disabled={!canProceed} className={onPrevious ? '' : 'ml-auto'}>
          Continuer
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
