pipeline {
    agent any
    
    environment {
        NODE_VERSION = '20'
        NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
        CI = 'true'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code...'
                checkout scm
            }
        }
        
        stage('Environment Info') {
            steps {
                echo '🔍 Checking environment...'
                sh '''
                    echo "Node version:"
                    node --version
                    echo "NPM version:"
                    npm --version
                    echo "Git branch:"
                    git branch --show-current || echo "Detached HEAD"
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing dependencies...'
                sh '''
                    # Clean install for reproducible builds
                    npm ci
                '''
            }
        }
        
        stage('Prisma Generate') {
            steps {
                echo '🔧 Generating Prisma client...'
                sh '''
                    npx prisma generate
                '''
            }
        }
        
        stage('Prisma Validate') {
            steps {
                echo '✅ Validating Prisma schema...'
                sh '''
                    npx prisma validate
                '''
            }
            post {
                failure {
                    echo '❌ Prisma schema validation failed - check your schema.prisma file'
                }
            }
        }
        
        stage('Lint Check') {
            steps {
                echo '🔎 Running ESLint...'
                sh '''
                    npm run lint
                '''
            }
            post {
                failure {
                    echo '❌ Linting failed - fix code style issues before deploying'
                }
            }
        }
        
        stage('TypeScript Check') {
            steps {
                echo '📘 Checking TypeScript types...'
                sh '''
                    # Check if there are any TypeScript errors
                    npx tsc --noEmit
                '''
            }
            post {
                failure {
                    echo '❌ TypeScript type check failed - fix type errors'
                }
            }
        }
        
        stage('Build Test') {
            steps {
                echo '🏗️ Testing production build...'
                sh '''
                    # Test that the app builds successfully
                    npm run build
                '''
            }
            post {
                success {
                    echo '✅ Build successful!'
                }
                failure {
                    echo '❌ Build failed - check the error logs above'
                }
                always {
                    // Clean up build artifacts to save space
                    sh 'rm -rf .next || true'
                }
            }
        }
        
        stage('Security Audit') {
            steps {
                echo '🔒 Running security audit...'
                sh '''
                    # Check for known vulnerabilities
                    npm audit --audit-level=high || echo "⚠️ Security vulnerabilities found (non-blocking)"
                '''
            }
        }
        
        stage('Deployment Ready') {
            steps {
                echo '🚀 All checks passed! Ready for deployment.'
                echo '📋 Summary:'
                echo '   ✅ Code checked out'
                echo '   ✅ Dependencies installed'
                echo '   ✅ Prisma schema validated'
                echo '   ✅ Linting passed'
                echo '   ✅ TypeScript checks passed'
                echo '   ✅ Build test successful'
                echo ''
                echo '🎯 Vercel will automatically deploy this commit to production.'
            }
        }
    }
    
    post {
        success {
            echo '✅ ============================================='
            echo '✅ Pipeline completed successfully!'
            echo '✅ Vercel will handle the deployment.'
            echo '✅ ============================================='
        }
        failure {
            echo '❌ ============================================='
            echo '❌ Pipeline failed!'
            echo '❌ Deployment has been blocked.'
            echo '❌ Please fix the errors and push again.'
            echo '❌ ============================================='
        }
        always {
            // Clean up workspace to save disk space
            cleanWs(
                cleanWhenNotBuilt: false,
                deleteDirs: true,
                disableDeferredWipeout: true,
                notFailBuild: true,
                patterns: [
                    [pattern: '.npm', type: 'INCLUDE'],
                    [pattern: 'node_modules', type: 'INCLUDE'],
                    [pattern: '.next', type: 'INCLUDE']
                ]
            )
        }
    }
}

