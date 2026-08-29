{ pkgs, lib, config, inputs, ... }:
{
  packages = with pkgs; [
    nodejs_24
    nodePackages.pnpm
  ];

  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
    pnpm.enable = true;
  };

  enterShell = ''
    echo "syntaxdiff devenv — node $(node --version) pnpm $(pnpm --version)"
  '';

  # ponytail: minimal devenv — no services, no extra processes.
  # add when needed: services.postgres, etc.
}
