import {LogLevel, ViteDevServer, build, createServer} from 'vite';
import electronPath from 'electron';
import {ChildProcess, spawn} from 'child_process';

type Environment = 'production' | 'development';
type ViteConfig = {
    mode: Environment
    logLevel: LogLevel
}

const config: ViteConfig = {
    mode: process.env.ENVIRONMENT as Environment,
    logLevel: 'info'
}


const setDevServerUrl = (url: string) => { process.env.VITE_DEV_SERVER_URL = url }


const buildMain = async ({ resolvedUrls }: ViteDevServer): Promise<void> => {
    const [serverUrl] = resolvedUrls?.local || [];
    setDevServerUrl(serverUrl)

    let app: ChildProcess | null = null;
    await build({
        ...config,
        configFile: 'src/core/main/vite.config.ts',
        build: { watch: {} },
        plugins: [
          {
            name: 'Reload_App_On_Main_Change',
            writeBundle: () => { app = respawnAppProcess(app); }
          },
        ],
    });
}

const buildPreload = async ({ ws }: ViteDevServer): Promise<void> => {
    await build({
        ...config,
        configFile: 'src/core/preload/vite.config.ts',
        build: { watch: {} },
        plugins: [
          {
            name: 'Reload_Page_On_Package_Change',
            writeBundle: () => { ws.send({ type: 'full-reload' }); }
          },
        ],
      });
}

const createRendererDevServer = async(): Promise<ViteDevServer> => {
    const server = await createServer({
        ...config,
        configFile: 'src/ui/vite.config.ts',
    });

    server.listen();

    return server;
}

const respawnAppProcess = (exitingAppProcess: ChildProcess | null): ChildProcess => {
    killExisitngAppProcess(exitingAppProcess)

    const app = spawn(String(electronPath), ['--inspect', '.'], { stdio: 'inherit' });
    app.addListener('exit', process.exit);

    return app;
}

const killExisitngAppProcess = (processToKill: ChildProcess | null): void => {
    if(processToKill) {
        processToKill.removeListener('exit', process.exit);
        processToKill.kill('SIGINT');
        processToKill = null;
    }
}


const start = async (): Promise<void> => {
    try {
        const server = await createRendererDevServer();
    
        await buildPreload(server);
        await buildMain(server);
    } catch (error) {
        console.error(`Unable to start application: `, error)
    }
}


start();