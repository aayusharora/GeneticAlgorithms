import Model from '../Model';

export default class GeneticModel extends Model {
  train(chromosomes) {
    const parents = this.select(chromosomes);
    const offspring = this.crossOver(parents, chromosomes);
    this.mutate(offspring);
  }

  fit(chromosomes) {
    this.train(chromosomes);
  }

  select(chromosomes) {
    const parents = [chromosomes[0], chromosomes[1]];
    return parents;
  }

  crossOver(parents, chromosomes) {
    // Clone from parents
    // console.info(parents)
    const offspring1 = parents[0];
    const offspring2 = parents[1];
    console.info("off1:",offspring1);
    console.info("off2:",offspring2);
    // Select a random crossover point
    const crossOverPoint = Math.floor(Math.random() * offspring1.length);
    console.info("cross here: ",crossOverPoint);
    // Swap values among parents
    for (let i = 0; i < crossOverPoint; i += 1) {
        const temp = offspring1[i];
        offspring1[i] = offspring2[i];
        offspring2[i] = temp;
    }
    const offspring = [offspring1, offspring2];
    // Replace the last 2 with the new offspring
    for (let i = 0; i < 2; i += 1) {
      chromosomes[chromosomes.length - i - 1] = offspring[i];
    }
    console.info("child: ",offspring)
    return offspring;
  }

  mutate(chromosomes) {
    chromosomes.forEach(chromosome => {
      const mutationPoint = Math.floor(Math.random() * chromosomes.length);
      chromosome[mutationPoint] = Math.random();
    });
  }
}
