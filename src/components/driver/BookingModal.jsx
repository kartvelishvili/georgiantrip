import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const BookingModal = ({ booking, isOpen, onClose, onUpdateStatus }) => {
  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-xl">
            <DialogHeader>
                <DialogTitle>Booking Details</DialogTitle>
                <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{booking.status.toUpperCase()}</Badge>
                    <span className="text-sm text-gray-500">{new Date(booking.created_at).toLocaleDateString()}</span>
                </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
                {/* Route Info */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                        <span className="font-bold">Pickup</span>
                        <span>{booking.from_location || booking.start_location_id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold">Dropoff</span>
                        <span>{booking.to_location || booking.end_location_id}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 pt-2 border-t border-gray-200">
                        <span>Date & Time</span>
                        <span>{booking.date} at {booking.time}</span>
                    </div>
                </div>

                {/* Customer Info */}
                <div>
                    <h3 className="font-bold mb-2">Customer</h3>
                    <p>{booking.customer_first_name} {booking.customer_last_name}</p>
                    <p className="text-sm text-gray-500">{booking.customer_phone}</p>
                    <p className="text-sm text-gray-500">{booking.customer_email}</p>
                    {booking.customer_comment && (
                        <div className="mt-2 text-sm bg-yellow-50 p-2 rounded text-yellow-800 border border-yellow-100">
                            "{booking.customer_comment}"
                        </div>
                    )}
                </div>

                {/* Pricing */}
                <div>
                    <h3 className="font-bold mb-2">Payment Breakdown</h3>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Distance</span> <span>{booking.distance_km} km</span></div>
                        <div className="flex justify-between"><span>Total Price</span> <span className="font-bold text-green-700">₾{booking.final_price || booking.total_price}</span></div>
                        <div className="flex justify-between text-gray-400 text-xs"><span>Platform Fee (30%)</span> <span>₾{((booking.final_price || booking.total_price) * 0.3).toFixed(1)}</span></div>
                        <div className="flex justify-between text-gray-500 font-bold border-t pt-1 mt-1"><span>Your Net Earning</span> <span>₾{((booking.final_price || booking.total_price) * 0.7).toFixed(1)}</span></div>
                    </div>
                </div>
            </div>

            <DialogFooter className="flex gap-2 justify-end">
                {booking.status === 'pending' && (
                    <>
                        <Button variant="destructive" onClick={() => onUpdateStatus(booking.id, 'rejected')}>Reject</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => onUpdateStatus(booking.id, 'confirmed')}>Accept Booking</Button>
                    </>
                )}
                {booking.status === 'confirmed' && (
                    <>
                         <Button variant="outline" onClick={() => onUpdateStatus(booking.id, 'cancelled')}>Cancel Trip</Button>
                         <Button className="bg-green-600" onClick={() => onUpdateStatus(booking.id, 'completed')}>Mark Completed</Button>
                    </>
                )}
                <Button variant="ghost" onClick={onClose}>Close</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
};

export default BookingModal;