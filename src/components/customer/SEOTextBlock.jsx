import React from 'react';

const SEOTextBlock = ({ from, to }) => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container-custom max-w-4xl text-center">
        <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
           Transfer from {from} to {to}
        </h2>
        <p className="text-gray-600 leading-relaxed text-sm">
           Book a private transfer from {from} to {to} with GeorgianTrip. We offer the best prices in Georgia with verified drivers and comfortable cars. 
           Unlike standard taxis, our service allows you to stop for sightseeing at no extra cost. 
           The distance is calculated automatically and the price is fixed before you book. 
           Enjoy a stress-free journey through the beautiful landscapes of Georgia.
        </p>
      </div>
    </section>
  );
};

export default SEOTextBlock;