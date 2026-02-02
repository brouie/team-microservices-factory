"use client";

import { useEffect, useState } from "react";

import {
  createAccess,
  createToken,
  deployService,
  fetchServices,
  ServiceRecord,
  submitIdea
} from "../lib/api";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadServices = async () => {
    const data = await fetchServices();
    setServices(data);
  };

  useEffect(() => {
    loadServices().catch((error) => setMessage(error.message));
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");
    try {
      await submitIdea(idea);
      setIdea("");
      await loadServices();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async (serviceId: string) => {
    setLoading(true);
    setMessage("");
    try {
      await deployService(serviceId);
      await loadServices();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleToken = async (serviceId: string) => {
    setLoading(true);
    setMessage("");
    try {
      await createToken(serviceId);
      await loadServices();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccess = async (serviceId: string) => {
    setLoading(true);
    setMessage("");
    try {
      const access = await createAccess(serviceId);
      setMessage(
        `API base: ${access.api_base_url} | Token: ${access.token_address} | API key: ${access.api_key}`
      );
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid">
      <section className="panel">
        <h2>Submit Idea</h2>
        <label htmlFor="idea">Describe the microservice</label>
        <textarea
          id="idea"
          rows={6}
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          placeholder="Example: Summarize meeting notes and return action items."
        />
        <button
          type="button"
          disabled={!idea.trim() || loading}
          onClick={handleSubmit}
        >
          Submit
        </button>
        {message ? <p className="muted">{message}</p> : null}
      </section>

      <section className="panel">
        <h2>Services</h2>
        {services.length === 0 ? (
          <p className="muted">No services yet.</p>
        ) : (
          services.map((service) => (
            <div className="service-card" key={service.id}>
              <p>{service.idea}</p>
              <p className="muted">Status: {service.status}</p>
              <p className="muted">
                Token: {service.token_address ?? "Not created"}
              </p>
              <p className="muted">
                API: {service.api_base_url ?? "Not deployed"}
              </p>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDeploy(service.id)}
              >
                Deploy
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleToken(service.id)}
              >
                Create Token
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleAccess(service.id)}
              >
                Get Access
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
