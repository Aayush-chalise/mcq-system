import { Link } from 'react-router-dom'
import { SignUpButton, useUser } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import Button from '../components/common/Button'
import WaveBackground from '../components/common/WaveBackground'
import GlassCard from '../components/common/GlassCard'
import { BookOpen, Zap, BarChart3 } from 'lucide-react'

function Home() {
  const { isSignedIn } = useUser()

  const features = [
    {
      icon: <BookOpen size={32} />,
      title: 'Question Sets',
      description: 'Practice with curated question sets across multiple subjects',
    },
    {
      icon: <Zap size={32} />,
      title: 'Timed Exams',
      description: 'Challenge yourself with timed exams created by admins',
    },
    {
      icon: <BarChart3 size={32} />,
      title: 'Detailed Results',
      description: 'Get comprehensive analysis of your performance',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-900 to-primary text-white overflow-hidden pt-16">
      <WaveBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="py-20 text-center"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-accent via-secondary to-accent bg-clip-text text-transparent"
          >
            Master Your Knowledge
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl mb-8 text-white/80 max-w-3xl mx-auto"
          >
            Practice with curated question sets and challenging exams to enhance your learning.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-4 justify-center"
          >
            {isSignedIn ? (
              <>
                <Link to="/question-bank">
                  <Button variant="primary" size="lg">
                    Start Practicing
                  </Button>
                </Link>
                <Link to="/exams">
                  <Button variant="secondary" size="lg">
                    Browse Exams
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <SignUpButton mode="modal">
                  <Button variant="primary" size="lg">
                    Get Started Free
                  </Button>
                </SignUpButton>
                <SignUpButton mode="modal">
                  <Button variant="secondary" size="lg">
                    Create Account
                  </Button>
                </SignUpButton>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="py-20"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl font-bold text-center mb-16 text-accent"
          >
            Why Choose MCQ System?
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <GlassCard className="text-center h-full hover:border-accent/50">
                  <div className="text-accent mb-4 flex justify-center">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-4 text-accent">{feature.title}</h3>
                  <p className="text-white/80">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="py-20 text-center"
        >
          <GlassCard className="border-accent/50">
            <h2 className="text-4xl font-bold mb-6 text-accent">Ready to Get Started?</h2>
            <p className="text-xl text-white/80 mb-8">Join thousands of learners improving their knowledge</p>
            {!isSignedIn && (
              <SignUpButton mode="modal">
                <Button variant="primary" size="lg">
                  Sign Up Now
                </Button>
              </SignUpButton>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}

export default Home
