import Image from "next/image"
import Link from "next/link"
import { FaDatabase, FaExchangeAlt, FaLayerGroup, FaCodeBranch, FaBookOpen } from "react-icons/fa"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black opacity-60"></div>
          <div className="w-full h-full bg-gray-800">
            {/* Fallback color in case image doesn't load */}
            <Image src="/hero-bg.jpg" alt="Data Migration" fill style={{ objectFit: "cover" }} priority />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">Expert Data Migration Services</h1>
            <p className="text-xl md:text-2xl mb-8">
              Seamlessly transform and migrate your data with SSJ IT Consultance's specialized solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/services" className="btn btn-primary text-center">
                Our Services
              </Link>
              <Link href="/contact" className="btn btn-outline text-center">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">About SSJ IT Consultance</h2>
              <p className="text-lg text-gray-600 mb-6">
                SSJ IT Consultance is a leading provider of data migration and IT consulting services. We specialize in
                helping businesses seamlessly transition their data systems with minimal disruption to operations.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                With our team of experienced professionals, we deliver tailored solutions that meet your specific
                business needs, ensuring a smooth and efficient migration process.
              </p>
              <Link href="/about" className="btn btn-primary">
                Learn More About Us
              </Link>
            </div>
            <div className="mt-12 lg:mt-0">
              <Image
                src="/about-image.jpg"
                alt="About SSJ IT Consultance"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Our Services</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We offer comprehensive data migration and IT consulting services to help your business thrive in the
              digital landscape.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service Card 1 */}
            <div className="bg-white rounded-lg shadow-md p-6 transition-transform hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FaDatabase className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-2">SQL Server Migration</h3>
              <p className="text-gray-600 mb-4">
                Expert SQL Server migration services to help you seamlessly transition your databases with minimal
                downtime.
              </p>
              <Link href="/services#sql-server" className="text-primary font-medium hover:text-primary-dark">
                Learn More →
              </Link>
            </div>

            {/* Service Card 2 */}
            <div className="bg-white rounded-lg shadow-md p-6 transition-transform hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FaExchangeAlt className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-2">ETL Solutions</h3>
              <p className="text-gray-600 mb-4">
                Comprehensive Extract, Transform, Load (ETL) solutions to efficiently manage your data integration
                needs.
              </p>
              <Link href="/services#etl" className="text-primary font-medium hover:text-primary-dark">
                Learn More →
              </Link>
            </div>

            {/* Service Card 3 */}
            <div className="bg-white rounded-lg shadow-md p-6 transition-transform hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FaLayerGroup className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-2">SAP BODS</h3>
              <p className="text-gray-600 mb-4">
                Specialized SAP Business Objects Data Services (BODS) implementation and support for enterprise data
                integration.
              </p>
              <Link href="/services#sap-bods" className="text-primary font-medium hover:text-primary-dark">
                Learn More →
              </Link>
            </div>

            {/* Service Card 4 */}
            <div className="bg-white rounded-lg shadow-md p-6 transition-transform hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FaCodeBranch className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-2">Syniti</h3>
              <p className="text-gray-600 mb-4">
                Advanced Syniti data migration and management services for complex enterprise environments.
              </p>
              <Link href="/services#syniti" className="text-primary font-medium hover:text-primary-dark">
                Learn More →
              </Link>
            </div>

            {/* Service Card 5 */}
            <div className="bg-white rounded-lg shadow-md p-6 transition-transform hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FaBookOpen className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-2">IT Training</h3>
              <p className="text-gray-600 mb-4">
                Comprehensive IT training programs tailored to your organization's specific needs and technology stack.
              </p>
              <Link href="/services#it-training" className="text-primary font-medium hover:text-primary-dark">
                Learn More →
              </Link>
            </div>

            {/* View All Services Card */}
            <div className="bg-primary rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-white transition-transform hover:transform hover:scale-105">
              <h3 className="text-xl font-bold mb-2">Explore All Services</h3>
              <p className="text-white/80 mb-4 text-center">
                Discover our complete range of data migration and IT consulting services.
              </p>
              <Link href="/services" className="btn bg-white text-primary hover:bg-gray-100">
                View All Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Data Infrastructure?</h2>
              <p className="text-lg text-gray-300 mb-8">
                Contact us today to discuss how our expert data migration services can help your business achieve its
                goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact" className="btn bg-primary text-white hover:bg-primary-dark">
                  Contact Us
                </Link>
                <Link href="/services" className="btn bg-transparent border border-white text-white hover:bg-white/10">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="bg-white/10 rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-4">Get a Free Consultation</h3>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full btn bg-primary text-white hover:bg-primary-dark">
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">What Our Clients Say</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what our clients have to say about our data migration services.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <Image src="/testimonial-1.jpg" alt="Client" width={60} height={60} className="rounded-full" />
                </div>
                <div>
                  <h4 className="font-bold text-secondary">John Smith</h4>
                  <p className="text-sm text-gray-500">CTO, Tech Innovations</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "SSJ IT Consultance helped us migrate our entire database infrastructure with zero downtime. Their
                expertise and attention to detail were impressive."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <Image src="/testimonial-2.jpg" alt="Client" width={60} height={60} className="rounded-full" />
                </div>
                <div>
                  <h4 className="font-bold text-secondary">Sarah Johnson</h4>
                  <p className="text-sm text-gray-500">Data Manager, Global Solutions</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The ETL solutions provided by SSJ IT Consultance transformed our data processing capabilities. We've
                seen a 40% improvement in efficiency."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <Image src="/testimonial-3.jpg" alt="Client" width={60} height={60} className="rounded-full" />
                </div>
                <div>
                  <h4 className="font-bold text-secondary">Michael Chen</h4>
                  <p className="text-sm text-gray-500">IT Director, Enterprise Corp</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The training provided by SSJ IT Consultance was exceptional. Our team is now fully equipped to handle
                our complex data environment."
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
