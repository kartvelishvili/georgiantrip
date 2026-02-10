import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  CarFront
} from 'lucide-react';
import CarSpecsGrid from './CarSpecsGrid';

const CarCard = ({ car, onDelete, onToggleActive }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/driver/cars/${car.id}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/driver/cars/${car.id}/edit`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(car.id);
  };

  const handleToggle = (e) => {
    e.stopPropagation();
  };

  // Status Badge Logic
  const getStatusBadge = () => {
    if (!car.active) return <Badge variant="secondary" className="bg-gray-500/90 text-white border-0 backdrop-blur-sm">Inactive</Badge>;
    const isComplete = car.main_photo && car.gallery_images?.length >= 3;
    if (isComplete) return <Badge className="bg-green-600/90 text-white border-0 backdrop-blur-sm">Active & Published</Badge>;
    return <Badge className="bg-amber-500/90 text-white border-0 backdrop-blur-sm">Active (Pending Info)</Badge>;
  };

  // Verification Badge Logic
  const getVerificationIcon = () => {
    switch(car.verification_status) {
      case 'approved': return <Badge className="bg-white/90 text-green-700 hover:bg-white border-0"><CheckCircle2 className="w-3 h-3 mr-1"/> Approved</Badge>;
      case 'rejected': return <Badge className="bg-white/90 text-red-700 hover:bg-white border-0"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>;
      default: return <Badge className="bg-white/90 text-yellow-700 hover:bg-white border-0"><AlertCircle className="w-3 h-3 mr-1"/> Pending</Badge>;
    }
  };

  return (
    <Card 
      className="group relative flex flex-col overflow-hidden border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white cursor-pointer"
      onClick={handleViewDetails}
    >
      {/* Image Section */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
        {car.main_photo ? (
          <img 
            src={car.main_photo} 
            alt={`${car.make} ${car.model}`} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <CarFront className="h-12 w-12" />
          </div>
        )}
        
        {/* Overlays */}
        <div className="absolute left-3 top-3 flex gap-2">
          {getStatusBadge()}
        </div>
        <div className="absolute right-3 top-3">
          {getVerificationIcon()}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
              {car.make} {car.model} <span className="text-gray-500 font-normal">{car.year}</span>
            </h3>
          </div>
          <p className="text-sm font-medium text-gray-500 font-mono">{car.license_plate}</p>
        </div>

        {/* Specs Grid */}
        <div className="mb-4">
          <CarSpecsGrid 
            seats={car.seats} 
            luggage={car.luggage_capacity} 
            transmission={car.transmission} 
            fuel={car.fuel_type} 
            compact 
          />
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-gray-600 line-clamp-2 min-h-[40px]">
            {car.description || <span className="italic text-gray-400">No description provided.</span>}
        </p>

        {/* Action Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2" onClick={handleToggle}>
                <Switch 
                    checked={car.active} 
                    onCheckedChange={(checked) => onToggleActive(car.id, checked)}
                    className="data-[state=checked]:bg-blue-600"
                />
                <span className={`text-xs font-medium ${car.active ? 'text-blue-600' : 'text-gray-400'}`}>
                    {car.active ? 'Active' : 'Hidden'}
                </span>
            </div>
            
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={handleEdit} title="Edit">
                    <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={handleDelete} title="Delete">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
            {/* Mobile-only visible actions fallback since hover doesn't exist */}
            <div className="flex gap-1 md:hidden">
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={handleEdit}>
                    <Edit className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </div>
    </Card>
  );
};

export default CarCard;