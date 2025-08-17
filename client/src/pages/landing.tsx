import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header";
import { Link } from "wouter";
import { ShoppingBag, Users, Star, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header onSearch={() => {}} />
      
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to SafeSoft Boutique
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover premium products with exceptional quality. Join our community of satisfied customers and enjoy a personalized shopping experience.
          </p>
          <Link href="/login">
            <Button 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              data-testid="button-login"
            >
              Sign In to Shop
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <ShoppingBag className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Premium Products</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Curated selection of high-quality products with competitive pricing in DA
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Trusted Community</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Join thousands of satisfied customers who trust our platform
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Star className="h-12 w-12 mx-auto text-yellow-600 mb-4" />
              <CardTitle>Customer Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Read authentic reviews and ratings from verified customers
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Secure Shopping</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your personal information and transactions are protected
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-lg shadow-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Create your account to access exclusive deals and personalized recommendations
          </p>
          <div className="space-x-4">
            <Link href="/signup">
              <Button 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-signup"
              >
                Create Account
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                size="lg"
                variant="outline"
                data-testid="button-signin"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}