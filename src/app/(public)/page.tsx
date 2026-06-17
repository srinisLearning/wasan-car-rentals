import React from 'react'
import Header from '@/components/functional/Header'
import Footer from '@/components/functional/Footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const HomePage = () => {
  const carCategories = [
    {
      id: 1,
      name: 'Economy',
      description: 'Perfect for budget-conscious travelers',
      price: 'From ₹2500/day',
      imageUrl: 'images/alto.png',
    },
    {
      id: 2,
      name: 'Premium',
      description: 'Luxury and comfort for special occasions',
      price: 'From ₹20000/day',
      imageUrl: 'images/elevate.png',
    },
    {
      id: 3,
      name: 'Family',
      description: 'Spacious vehicles for group travel',
      price: 'From ₹10000/day',
      imageUrl: 'images/innova.png',
    },
    {
      id: 4,
      name: 'SUV',
      description: 'Adventure-ready off-road vehicles',
      price: 'From ₹15000/day',
      imageUrl: 'images/scorpio.png',
    },
  ]

  const features = [
    {
      imageUrl:'images/easy-booking.jpg',
      title: 'Easy Booking',
      description: 'Book your services quickly and effortlessly with our streamlined booking process. Our user-friendly platform allows you to schedule appointments, confirm details, and manage bookings in just a few clicks. Save time and enjoy a hassle-free experience designed to make reservations simple, convenient, and efficient for every customer.',
    },
    {
      imageUrl:'images/support.jpg',
      title: '24/7 Support',
      description: 'Our dedicated support team is available around the clock to assist you whenever you need help. Whether you have questions, need guidance, or face unexpected issues, we are always ready to provide prompt and reliable assistance, ensuring a smooth and stress-free experience any time of the day.',
    },
    {
      imageUrl:'images/affordable.jpg',
      title: 'Best Prices',
      description: 'We offer high-quality services at competitive and budget-friendly prices to ensure great value for every customer. Our transparent pricing structure eliminates hidden costs, helping you enjoy reliable services without overspending. Experience the perfect balance of affordability, quality, and customer satisfaction tailored to your needs.',
    },
    {imageUrl:'images/flexiable.jpg',
      title: 'Flexible Terms',
      description: 'Enjoy complete flexibility with customizable plans and customer-friendly terms designed to suit your preferences. Whether you need short-term arrangements, easy modifications, or adaptable options, our flexible policies provide convenience and peace of mind, allowing you to make changes whenever necessary without complications.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="text-white py-24 px-6"
          style={{
            backgroundImage: "url('images/car_rentals_banner.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
             
          }}
        >
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-2xl font-bold mb-6">
              Drive Your Dream Car
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white">
              Experience affordable and reliable car rental services across India
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="text-white bg-primary font-semibold text-sm px-4 py-3"
              >
                <Link href="/register">Get Started</Link>
              </Button>
              <Button
                asChild
                
                className="text-white bg-primary font-semibold text-sm px-4 py-3"
              >
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Car Categories Section */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-primary">
              Our Car Fleet
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {carCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-sm shadow-md p-6 hover:shadow-sm transition-shadow"
                >
                  <div className="mb-4 flex items-center justify-center">
                    <img
                      src={category.imageUrl}
                      alt={`${category.name} car`}
                      className="h-48 w-72  object-cover rounded-xl shadow-2xs"
                    />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-primary">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <p className="text-primary font-bold text-lg">{category.price}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-primary">
              Why Choose Wasan?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <img
                      src={feature.imageUrl}
                      alt={`${feature.title} car`}
                      className="h-48 w-48  object-cover rounded-xl shadow-2xs text-center mx-auto mb-4"
                    />
                  <h3 className="text-xl font-bold mb-2 text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-justify text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-white py-16 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Rent?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of satisfied customers across India
            </p>
            <Button
              asChild
              className="bg-white text-primary hover:bg-gray-100 font-semibold text-lg px-8 py-6"
            >
              <Link href="/register">Register Now</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default HomePage
