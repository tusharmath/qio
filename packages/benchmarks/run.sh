echo "# Benchmarks" >benchmarks/README.md
ls -d benchmarks/* | grep .js | xargs -L 1 node >>benchmarks/README.md
