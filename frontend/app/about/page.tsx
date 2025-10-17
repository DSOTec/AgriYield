"use client"

import { motion } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Target, Compass, Shield, Zap, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { AnimatedCounter } from "@/components/ui/animated-counter"

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const values = [
  {
    icon: Shield,
    title: "Transparency",
    description: "Blockchain-powered transparency ensures every transaction is visible and verifiable.",
  },
  {
    icon: Zap,
    title: "Empowerment",
    description: "Giving African farmers direct access to funding without intermediaries.",
  },
  {
    icon: TrendingUp,
    title: "Innovation",
    description: "Leveraging cutting-edge technology to revolutionize agricultural financing.",
  },
  {
    icon: Shield,
    title: "Trust",
    description: "Building a trustworthy ecosystem where farmers and investors thrive together.",
  },
  {
    icon: Users,
    title: "Growth",
    description: "Fostering sustainable agricultural growth across the African continent.",
  },
]

const team = [
  {
    name: "Adewale Johnson",
    role: "Co-Founder & CEO",
    bio: "Former agricultural economist with 15+ years experience in African agribusiness.",
    image: "/team/ceo.jpg",
    initials: "AJ",
  },
  {
    name: "Chioma Okafor",
    role: "Co-Founder & CTO",
    bio: "Blockchain architect passionate about decentralized solutions for emerging markets.",
    image: "/team/cto.jpg",
    initials: "CO",
  },
  {
    name: "Kwame Mensah",
    role: "Head of Operations",
    bio: "Expert in supply chain management and farmer relations across West Africa.",
    image: "/team/coo.jpg",
    initials: "KM",
  },
  {
    name: "Fatima Hassan",
    role: "Lead Developer",
    bio: "Full-stack developer specializing in Web3 and smart contract development.",
    image: "/team/dev.jpg",
    initials: "FH",
  },
  {
    name: "Oluwaseun Adeyemi",
    role: "Agricultural Advisor",
    bio: "Agronomist with deep knowledge of sustainable farming practices in Africa.",
    image: "/team/advisor1.jpg",
    initials: "OA",
  },
  {
    name: "Amara Nwosu",
    role: "Investment Advisor",
    bio: "Financial analyst with expertise in impact investing and agricultural finance.",
    image: "/team/advisor2.jpg",
    initials: "AN",
  },
]

const metrics = [
  { value: 500, suffix: "+", label: "Farmers Supported" },
  { value: 1000, suffix: "+", label: "Active Investors" },
  { value: 50, suffix: "M+", label: "₦ Raised", prefix: "₦" },
  { value: 95, suffix: "%", label: "Success Rate" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        {/* Hero Section with Parallax Effect */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-primary/5 overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <motion.div
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]"
          />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div {...fadeInUp} className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                About AgriYield
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Empowering African farmers through transparent, decentralized funding.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Vision & Mission Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"
            >
              <motion.div variants={fadeInUp}>
                <Card className="h-full border-2 hover:border-primary transition-colors duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Target className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold">Our Vision</h2>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      To create a world where every African farmer has access to the capital they need to grow,
                      thrive, and contribute to food security across the continent. We envision a future where
                      blockchain technology bridges the gap between agricultural potential and financial opportunity.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full border-2 hover:border-primary transition-colors duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Compass className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold">Our Mission</h2>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Connecting investors and farmers for sustainable agricultural growth using blockchain
                      transparency. We provide a secure, transparent platform that enables direct funding,
                      eliminates intermediaries, and ensures fair returns for all stakeholders.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Animated Metrics Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Impact</h2>
              <p className="text-lg text-muted-foreground">Making a difference in African agriculture</p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
            >
              {metrics.map((metric, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-0">
                      <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                        <AnimatedCounter
                          value={metric.value}
                          suffix={metric.suffix}
                          prefix={metric.prefix}
                        />
                      </div>
                      <p className="text-sm md:text-base text-muted-foreground">{metric.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Simple, transparent, and secure — three steps to agricultural prosperity
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            >
              {/* Step 1: Fund */}
              <motion.div variants={fadeInUp}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg"
                    >
                      1
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4">💰 Fund</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Browse verified farm listings and invest in agricultural projects that align with your goals. 
                      Connect your wallet and fund farms with AGT tokens securely on the blockchain.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Step 2: Farm */}
              <motion.div variants={fadeInUp}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                      className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg"
                    >
                      2
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4">🌾 Farm</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Farmers receive funding instantly and begin cultivation. Track real-time progress through our 
                      transparent dashboard with updates, photos, and blockchain-verified milestones.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Step 3: Earn */}
              <motion.div variants={fadeInUp}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                      className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg"
                    >
                      3
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4">📈 Earn</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Harvest season brings returns! Investors earn competitive ROI distributed automatically via 
                      smart contracts. Withdraw earnings anytime directly to your wallet.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do at AgriYield
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
            >
              {values.map((value, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                        <value.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        {/* <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Passionate individuals dedicated to transforming African agriculture
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
            >
              {team.map((member, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary/20">
                        <AvatarImage src={member.image} alt={member.name} />
                        <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                      <p className="text-sm text-primary font-semibold mb-3">{member.role}</p>
                      <p className="text-sm text-muted-foreground">{member.bio}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section> */}

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Mission</h2>
              <p className="text-lg md:text-xl mb-8 text-white/90">
                Be part of the revolution transforming African agriculture. Whether you're a farmer seeking funding
                or an investor looking for impact, AgriYield is your platform.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto"
                  asChild
                >
                  <Link href="/signup">Get Started Today</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
