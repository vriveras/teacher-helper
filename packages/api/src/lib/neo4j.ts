import neo4j, { Driver, Session } from 'neo4j-driver';
import { getEnv } from '../config/env.js';

let driver: Driver | null = null;

export function getNeo4jDriver(): Driver | null {
  const env = getEnv();

  if (!env.NEO4J_URI || !env.NEO4J_USER || !env.NEO4J_PASSWORD) {
    return null;
  }

  if (!driver) {
    driver = neo4j.driver(env.NEO4J_URI, neo4j.auth.basic(env.NEO4J_USER, env.NEO4J_PASSWORD));
  }

  return driver;
}

export function getNeo4jSession(): Session | null {
  const driverInstance = getNeo4jDriver();
  if (!driverInstance) {
    return null;
  }
  return driverInstance.session();
}

export async function disconnectNeo4j(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}
