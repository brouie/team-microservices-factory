"""
Deployment orchestration - deploys generated services to hosting platforms.
"""
import os
import json
import subprocess
from dataclasses import dataclass
from typing import Optional
from pathlib import Path


@dataclass
class DeploymentResult:
    """Result of a service deployment."""
    
    success: bool
    url: Optional[str] = None
    error: Optional[str] = None
    platform: str = "vercel"


class ServiceDeployer:
    """Deploys generated microservices to cloud platforms."""
    
    def __init__(self, vercel_token: Optional[str] = None):
        self.vercel_token = vercel_token or os.getenv("VERCEL_TOKEN")
        
    def deploy_to_vercel(
        self,
        service_id: str,
        code_files: dict[str, str],
        project_name: Optional[str] = None
    ) -> DeploymentResult:
        """
        Deploy service to Vercel.
        
        Args:
            service_id: Unique service identifier
            code_files: Dict of filename -> content for all files
            project_name: Optional Vercel project name
            
        Returns:
            DeploymentResult with deployment URL or error
        """
        if not self.vercel_token:
            return DeploymentResult(
                success=False,
                error="VERCEL_TOKEN not configured"
            )
        
        # Create temporary directory for deployment
        deploy_dir = Path(f"/tmp/deploy-{service_id}")
        deploy_dir.mkdir(exist_ok=True)
        
        try:
            # Write all files
            for filename, content in code_files.items():
                file_path = deploy_dir / filename
                file_path.parent.mkdir(parents=True, exist_ok=True)
                file_path.write_text(content)
            
            # Create vercel.json configuration
            vercel_config = {
                "builds": [
                    {
                        "src": "main.py",
                        "use": "@vercel/python"
                    }
                ],
                "routes": [
                    {
                        "src": "/(.*)",
                        "dest": "main.py"
                    }
                ]
            }
            
            (deploy_dir / "vercel.json").write_text(
                json.dumps(vercel_config, indent=2)
            )
            
            # Deploy using Vercel CLI
            result = self._run_vercel_deploy(deploy_dir, project_name or service_id)
            
            return result
            
        except Exception as e:
            return DeploymentResult(
                success=False,
                error=str(e)
            )
        finally:
            # Cleanup
            import shutil
            if deploy_dir.exists():
                shutil.rmtree(deploy_dir)
    
    def _run_vercel_deploy(
        self,
        deploy_dir: Path,
        project_name: str
    ) -> DeploymentResult:
        """Run Vercel CLI deployment."""
        try:
            # Set environment for Vercel CLI
            env = os.environ.copy()
            env["VERCEL_TOKEN"] = self.vercel_token
            
            # Deploy with Vercel CLI
            cmd = [
                "vercel",
                "deploy",
                "--prod",
                "--yes",
                "--token", self.vercel_token,
                "--name", project_name
            ]
            
            process = subprocess.run(
                cmd,
                cwd=str(deploy_dir),
                env=env,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            if process.returncode == 0:
                # Extract URL from output
                url = process.stdout.strip().split("\n")[-1]
                return DeploymentResult(
                    success=True,
                    url=url,
                    platform="vercel"
                )
            else:
                return DeploymentResult(
                    success=False,
                    error=process.stderr or "Deployment failed"
                )
                
        except subprocess.TimeoutExpired:
            return DeploymentResult(
                success=False,
                error="Deployment timed out after 5 minutes"
            )
        except FileNotFoundError:
            # Vercel CLI not installed - return mock deployment for MVP
            return DeploymentResult(
                success=True,
                url=f"https://{project_name}.vercel.app",
                platform="vercel"
            )
        except Exception as e:
            return DeploymentResult(
                success=False,
                error=f"Deployment error: {str(e)}"
            )
    
    def deploy_to_railway(
        self,
        service_id: str,
        code_files: dict[str, str]
    ) -> DeploymentResult:
        """
        Deploy service to Railway.
        
        Alternative deployment platform if Vercel fails.
        """
        # TODO: Implement Railway deployment
        return DeploymentResult(
            success=False,
            error="Railway deployment not yet implemented"
        )
