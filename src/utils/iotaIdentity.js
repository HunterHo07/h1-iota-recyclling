/**
 * 🆔 IOTA IDENTITY INTEGRATION
 * 
 * This module integrates IOTA Identity framework for:
 * - Decentralized Identity (DID) creation and management
 * - Verifiable Credentials for recycling activities
 * - User verification and reputation system
 * - Trust establishment between recyclers and collectors
 * 
 * Part of IOTA Trust Framework integration for hackathon
 */

// Simplified IOTA Identity integration for hackathon demo
// In production, use @iota/identity-wasm package

/**
 * IOTA Identity Manager for recycling marketplace
 */
export class IOTAIdentityManager {
  constructor() {
    this.identities = new Map()
    this.credentials = new Map()
    this.verificationHistory = new Map()
  }

  /**
   * Create a new DID for a user
   */
  async createDID(userAddress, userType = 'individual') {
    try {
      // Generate IOTA DID format
      const didId = `did:iota:${userAddress.slice(0, 20)}${Date.now()}`
      
      const didDocument = {
        id: didId,
        controller: userAddress,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        userType, // individual, organization, device
        verificationMethod: [{
          id: `${didId}#key-1`,
          type: 'Ed25519VerificationKey2020',
          controller: didId,
          publicKeyMultibase: this.generatePublicKey()
        }],
        authentication: [`${didId}#key-1`],
        assertionMethod: [`${didId}#key-1`],
        service: [{
          id: `${didId}#recycling-service`,
          type: 'RecyclingMarketplace',
          serviceEndpoint: 'https://iota-recycling.app/api/identity'
        }]
      }

      // Store identity
      this.identities.set(userAddress, {
        did: didId,
        document: didDocument,
        credentials: [],
        reputation: {
          score: 100, // Starting reputation
          verifiedCredentials: 0,
          completedJobs: 0,
          disputes: 0
        },
        created: Date.now()
      })

      console.log('🆔 DID created:', didId)
      
      return {
        success: true,
        did: didId,
        document: didDocument
      }
    } catch (error) {
      console.error('❌ Failed to create DID:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Issue a verifiable credential for recycling activity
   */
  async issueRecyclingCredential(issuerAddress, subjectAddress, credentialData) {
    try {
      const issuerIdentity = this.identities.get(issuerAddress)
      const subjectIdentity = this.identities.get(subjectAddress)

      if (!issuerIdentity || !subjectIdentity) {
        throw new Error('Issuer or subject identity not found')
      }

      const credentialId = `vc:recycling:${Date.now()}`
      
      const verifiableCredential = {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://iota.org/recycling/v1'
        ],
        id: credentialId,
        type: ['VerifiableCredential', 'RecyclingActivityCredential'],
        issuer: issuerIdentity.did,
        issuanceDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        credentialSubject: {
          id: subjectIdentity.did,
          ...credentialData,
          verifiedBy: issuerIdentity.did,
          timestamp: Date.now()
        },
        proof: {
          type: 'Ed25519Signature2020',
          created: new Date().toISOString(),
          verificationMethod: `${issuerIdentity.did}#key-1`,
          proofPurpose: 'assertionMethod',
          proofValue: this.generateProof(credentialData)
        }
      }

      // Store credential
      this.credentials.set(credentialId, verifiableCredential)
      
      // Add to subject's credentials
      subjectIdentity.credentials.push(credentialId)
      subjectIdentity.reputation.verifiedCredentials++

      console.log('📜 Verifiable credential issued:', credentialId)

      return {
        success: true,
        credentialId,
        credential: verifiableCredential
      }
    } catch (error) {
      console.error('❌ Failed to issue credential:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Verify a credential
   */
  async verifyCredential(credentialId) {
    try {
      const credential = this.credentials.get(credentialId)
      
      if (!credential) {
        throw new Error('Credential not found')
      }

      // Verify credential integrity
      const isValid = this.verifyProof(credential)
      const isNotExpired = new Date(credential.expirationDate) > new Date()
      const issuerExists = this.identities.has(credential.issuer.replace('did:iota:', ''))

      const verificationResult = {
        credentialId,
        isValid: isValid && isNotExpired && issuerExists,
        checks: {
          signatureValid: isValid,
          notExpired: isNotExpired,
          issuerExists: issuerExists
        },
        verifiedAt: Date.now()
      }

      // Store verification history
      if (!this.verificationHistory.has(credentialId)) {
        this.verificationHistory.set(credentialId, [])
      }
      this.verificationHistory.get(credentialId).push(verificationResult)

      return {
        success: true,
        verification: verificationResult
      }
    } catch (error) {
      console.error('❌ Failed to verify credential:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get user's identity and reputation
   */
  getUserIdentity(userAddress) {
    const identity = this.identities.get(userAddress)
    
    if (!identity) {
      return {
        success: false,
        error: 'Identity not found'
      }
    }

    return {
      success: true,
      identity: {
        did: identity.did,
        reputation: identity.reputation,
        credentialCount: identity.credentials.length,
        created: identity.created,
        isVerified: identity.reputation.verifiedCredentials > 0
      }
    }
  }

  /**
   * Update reputation based on activity
   */
  updateReputation(userAddress, activity) {
    const identity = this.identities.get(userAddress)
    
    if (!identity) {
      return { success: false, error: 'Identity not found' }
    }

    switch (activity.type) {
      case 'job_completed':
        identity.reputation.score += 10
        identity.reputation.completedJobs++
        break
      case 'job_disputed':
        identity.reputation.score -= 20
        identity.reputation.disputes++
        break
      case 'credential_verified':
        identity.reputation.score += 5
        break
      case 'late_completion':
        identity.reputation.score -= 5
        break
      default:
        break
    }

    // Ensure score stays within bounds
    identity.reputation.score = Math.max(0, Math.min(1000, identity.reputation.score))

    return {
      success: true,
      newScore: identity.reputation.score
    }
  }

  /**
   * Get all credentials for a user
   */
  getUserCredentials(userAddress) {
    const identity = this.identities.get(userAddress)
    
    if (!identity) {
      return { success: false, error: 'Identity not found' }
    }

    const credentials = identity.credentials.map(credId => {
      const credential = this.credentials.get(credId)
      return {
        id: credId,
        type: credential.type,
        issuanceDate: credential.issuanceDate,
        expirationDate: credential.expirationDate,
        credentialSubject: credential.credentialSubject
      }
    })

    return {
      success: true,
      credentials
    }
  }

  /**
   * Generate a mock public key
   */
  generatePublicKey() {
    return 'z' + Math.random().toString(36).substr(2, 43) // Mock multibase key
  }

  /**
   * Generate a mock proof
   */
  generateProof(data) {
    return 'z' + Math.random().toString(36).substr(2, 86) // Mock signature
  }

  /**
   * Verify a mock proof
   */
  verifyProof(credential) {
    // In real implementation, verify the cryptographic signature
    return credential.proof && credential.proof.proofValue.length > 0
  }

  /**
   * Create recycling activity credential data
   */
  createRecyclingActivityData(jobData, proofData) {
    return {
      activityType: 'recycling_collection',
      itemType: jobData.itemType,
      weight: proofData.actualWeight,
      location: jobData.location,
      proofHash: proofData.proofHash,
      jobId: jobData.jobId,
      completedAt: Date.now(),
      environmentalImpact: {
        co2Saved: Math.round(proofData.actualWeight * 0.5), // kg CO2
        energySaved: Math.round(proofData.actualWeight * 2), // kWh
      }
    }
  }

  /**
   * Get marketplace trust metrics
   */
  getMarketplaceTrustMetrics() {
    const totalIdentities = this.identities.size
    const verifiedIdentities = Array.from(this.identities.values())
      .filter(identity => identity.reputation.verifiedCredentials > 0).length
    const totalCredentials = this.credentials.size
    const averageReputation = Array.from(this.identities.values())
      .reduce((sum, identity) => sum + identity.reputation.score, 0) / totalIdentities || 0

    return {
      totalIdentities,
      verifiedIdentities,
      totalCredentials,
      averageReputation: Math.round(averageReputation),
      trustLevel: verifiedIdentities / totalIdentities || 0
    }
  }
}

// Export singleton instance
export const iotaIdentity = new IOTAIdentityManager()

export default iotaIdentity
