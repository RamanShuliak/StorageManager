using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Primitives;
using Serilog.Core;
using Serilog.Events;
using Serilog.Sinks.SystemConsole.Themes;
using Serilog;

namespace StorageManagerServer.Services;

public static class LogService
{
    private static ILogger? _logger;
    private static readonly string _logDirectory;
    private static readonly string _logFilePath;
    private static readonly int _logRetentionDays;
    private static readonly LoggingLevelSwitch _loggingLevelSwitch
        = new LoggingLevelSwitch(LogEventLevel.Information);

    static LogService()
    {
        IConfigurationRoot configuration = new ConfigurationBuilder()
            .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .Build();

        _logRetentionDays = Math.Max(configuration.GetValue<int>("LogService:LogRetentionDays", 7), 1);
        _logDirectory = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Logs");
        _logFilePath = Path.Combine(_logDirectory, "LogJournal.txt");

        if (!Directory.Exists(_logDirectory))
        {
            Directory.CreateDirectory(_logDirectory);
        }

        UpdateLogLevel(configuration.GetValue<string>("LogService:LogLevel"));

        LoggerConfiguring();

        ChangeToken.OnChange(() => configuration.GetReloadToken(), () =>
        {
            UpdateLogLevel(configuration.GetValue<string>("LogService:LogLevel"));
        });
    }

    public static Task<bool> WriteInformationLogAsync(string message)
    {
        WriteToConsoleTemporarily(() =>
        {
            _logger?.Information(message);
        });

        return Task.FromResult(true);
    }

    public static Task<bool> WriteWarningLogAsync(string message)
    {
        WriteToConsoleTemporarily(() =>
        {
            _logger?.Warning(message);
        });

        return Task.FromResult(true);
    }

    public static Task<bool> WriteErrorLogAsync(string message)
    {
        WriteToConsoleTemporarily(() =>
        {
            _logger?.Error(message);
        });
        return Task.FromResult(true);
    }

    #region Private Methods
    private static void LoggerConfiguring()
    {
        _logger = new LoggerConfiguration()
            .MinimumLevel.ControlledBy(_loggingLevelSwitch)
            .WriteTo.Console(
                theme: AnsiConsoleTheme.Literate,
                outputTemplate: "{Timestamp:HH:mm:ss} [{Level:u3}] {Message}{NewLine}{Exception}")
            .WriteTo.Async(a => a.File(
                _logFilePath,
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: _logRetentionDays))
            .CreateLogger();

        if (_logger == null)
        {
            Console.WriteLine("Error during Serilog initialisation.\n");
            throw new InvalidOperationException("Error during Serilog initialisation.\n");
        }
        else
        {
            var logPath = $"{AppContext.BaseDirectory}Logs";

            _logger?.Information($"LogService initialised successfully.\n\n" +
                $"You can found and read the logs of BTQBIntegrator by the next path:\n{logPath}.\n");

            Console.SetOut(TextWriter.Null);
            Console.SetError(TextWriter.Null);
        }
    }

    private static void UpdateLogLevel(string? logLevel)
    {
        if (Enum.TryParse(logLevel, true, out LogEventLevel level))
        {
            _loggingLevelSwitch.MinimumLevel = level;
        }
        else
        {
            _loggingLevelSwitch.MinimumLevel = LogEventLevel.Information;
        }
    }

    private static void WriteToConsoleTemporarily(Action action)
    {
        var originalOut = Console.Out;
        var originalError = Console.Error;

        Console.SetOut(new StreamWriter(Console.OpenStandardOutput()) { AutoFlush = true });
        Console.SetError(new StreamWriter(Console.OpenStandardError()) { AutoFlush = true });

        action();

        Console.SetOut(originalOut);
        Console.SetError(originalError);
    }
    #endregion
}
