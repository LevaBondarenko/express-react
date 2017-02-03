import HappyPack from 'happypack';
const happyThreadPool = new HappyPack.ThreadPool({size: 5});

export default function createHappyPlugin(id) {
  return new HappyPack({
    id: id,
    threadPool: happyThreadPool,
    verbose: false
  });
};
