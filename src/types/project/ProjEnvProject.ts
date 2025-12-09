

//--------------------------------------------------------------------------------

import { PmonComponent } from "../components/implementations";
import { ProjEnvProjectRegistry, findProjectRegistryById } from "../project/ProjEnvProjectRegistry"
import { OaLanguage } from "../localization/OaLanguage"
import { tr } from "../../utils/winccoa-localization"
import { getComponentName } from "../../utils/winccoa-components"
import { ProjEnvPmonProjectStatus } from "./ProjEnvPmonStatus";
import { ProjEnvProjectConfig } from "./ProjEnvProjectConfig";

/**
 * @brief WinCC OA Project class for managing project lifecycle and configuration
 * @details Handles project creation, registration, startup, shutdown and management
 *          of project components and settings.
 */
export interface ProjEnvProject
{
    private runnable : ProjEnvProjectRunnable;
    private version? : string;
    private installPath?: string;

    //------------------------------------------------------------------------------
  /**
   * @brief Sets the project identifier
   * @param id Project ID (directory name containing project files)
   * @return Error code:
   *          0 = Success
   *         -1 = Invalid project ID
   *         -2 = Invalid WinCC OA version
   *         -3 = Invalid project path
   */
  public  setId(id : string) : void {
    if (id === undefined || id.isEmpty())
    {
        // TODO throw exception
    //   this._errorHandler.severe(tr("Invalid argument in function $1(). The project ID must not be empty!").subst(__FUNCTION__));
      return;
    }

    if (id === this.getId())
    {
      return;
    }

    this._id = id;

    if (this.runnable == ProjEnvProjectRunnable.Unknown)
    {
      const registry : ProjEnvProjectRegistry = findProjectRegistryById();
      if (registry) {
        this.installPath = registry.installationDir;
        this.version = getProjectVersion(registry.installationDir);
      }
    }

    if (this.version === undefined) {
        /// todo throw error here
    }

    if (this.installPath === undefined) {
        /// todo throw error here
    }
  }

  //------------------------------------------------------------------------------
  /**
   * @brief Function returns project ID.
   * @return Project ID.
   * @exception Empty string.
   */
  public function getId() : string
  {
    return this._id;
  }

  public function getConfigPath() : string {
    path.join(directoryPath, 'config', 'config');
  }

  /**
     * Gets the WinCC OA version from project config file
     */
    private function getProjectVersion(installationDir: string): string | undefined {
        const configPath = this.getConfigPath();

        if (!fs.existsSync(configPath)) {
            return undefined;
        }

        try {
            const content = fs.readFileSync(configPath, 'utf-8');
            const lines = content.split('\n');
            let inGeneralSection = false;

            for (const line of lines) {
                const trimmedLine = line.trim();

                if (trimmedLine === '[general]') {
                    inGeneralSection = true;
                } else if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
                    inGeneralSection = false;
                } else if (inGeneralSection && trimmedLine.startsWith('proj_version')) {
                    const match = trimmedLine.match(/proj_version\s*=\s*['"](.*?)['"]/);
                    if (match) {
                        return match[1];
                    }
                }
            }
        } catch (error) {
            console.error(`Error reading config file ${configPath}:`, error);
        }

        return undefined;
    }

  //------------------------------------------------------------------------------
  /**
   * @brief Function set the project name.
   * @param name Project name.
   * @return Error code.
   * value | description
   * ------|------------
   * 0     | Success.
   * -1    | Name is not valid.
   */
  public function setName(name : string) : void
  {
    if (name.isEmpty())
    {
        // TODO throw error here
//      this._errorHandler.severe(tr("Invalid argument in function $1(). The project name must not be empty!").subst(__FUNCTION__));
      return;
    }

    this._name = name;
  }

  //------------------------------------------------------------------------------
  /**
   * @brief Function returns project name.
   * @return Project-name.
   * @exception Empty langString.
   */
  public function getName() : string
  {
    return this._name;
  }

  
  public function getDisplayName() : string
  {
    return this._name ? this._name : this._id;
  }

  //------------------------------------------------------------------------------
  /**
   * @brief Function set project version.
   * @param version Project version in format ```<major>.<minor>```
   * @return Error code. Returns 0 when successful. Otherwise -1.
   */
  public function setVersion(version : string) : void
  {
    if (version.isEmpty())
    {
     // TODO throw error here
// this._errorHandler.severe(tr("Invalid argument in function $1(). The project version must not be empty!\n$2").subst(__FUNCTION__, this.toString()));
      return;
    }

    this._version = version;
  }

  //------------------------------------------------------------------------------
  /**
   * @brief Function returns project version.
   * @return Project version.
   * @exception Empty string.
   */
  public function getVersion() : string
  {
    return this._version;
  }
  //------------------------------------------------------------------------------
  /**
   * @brief Function set project dir.
   */
  public function setInstallDir(path : string) : void
  {
    if (path.isEmpty())
    {
      // TODO throw error here
//this._errorHandler.severe(tr("Invalid argument in function $1(). The project path must not be empty!").subst(__FUNCTION__));
      return;
    }

    // TODO check if dir exists

    _path = makeNativePath(path + "/");

    return 0;
  }

  //------------------------------------------------------------------------------
  /**
   * @brief Function returns dir, where are project created.
   * @return Project installation dir.
   */
  public function getInstallDir() : string
  {
    return this._path;
  }

  //------------------------------------------------------------------------------
  /**
   * @brief Function returns project dir inclusive project self.
   * @return Project dir path.
   */
  public string getDir(const string relativeDirPath = "")
  {
    const string id = this.getId();

    if (id.isEmpty())
    {
      return "";
    }

    string path = this.getInstallDir();

    if (path.isEmpty())
    {
      return "";
    }

    return makeNativePath(path  + id + "/" + relativeDirPath);
  }

  //------------------------------------------------------------------------------
  /**
   * @brief Function returns project config path.
   * @param configFileName Name of the config file. Default: "config"
   * @return Project config path.
   */
  public string getConfigPath(const string configFileName = "config")
  {
    string path = this.getDir(CONFIG_REL_PATH);

    if (path.isEmpty())
      return "";

    return path + configFileName;
  }

  //------------------------------------------------------------------------------
  /** Function set project languages.
   * @param languages Project languages.
   * @return Error code. Returns 0 when successful. Otherwise -1.
   */
  public function setLanguages(languages : (OaLanguage)[]) : void
  {
    this._languages = languages;
  }

  //------------------------------------------------------------------------------
  /**
   * @brief Gets configured project languages
   * @return Dynamic array of configured language codes
   */
  public function getLanguages() : (OaLanguage)[]
  {
    return this._languages;
  }

  //------------------------------------------------------------------------------
  /**
   * @brief Sets whether the project is runnable
   * @details Not runnable project are typically sub-projects
   * @param runnable True if project should be runnable, false otherwise.
   */
  public function setRunnable(runnable : boolean) : void
  {
    if (runnable)
        this._runnable = ProjEnvProjectRunnable.Runnable;
    else
        this._runnable = ProjEnvProjectRunnable.NotRunnable;
  }

  //------------------------------------------------------------------------------
  /**
   * @brief Checks if project is configured as runnable
   * @return True if project is runnable, false otherwise
   */
  public function isRunnable() : boolean
  {
    if (this._runnable === ProjEnvProjectRunnable.Runnable)
        return true;
  }

  //------------------------------------------------------------------------------
  /** @brief Function checks if project (this object) is valid.
   * @return Returns TRUE when object is valid, otherwise FALSE.
   */
  public bool isValid()
  {
    return this.getInvalidReason().isEmpty();
  }

  //------------------------------------------------------------------------------
  /** Function returns the reason, why is this project invalid.
   * @return empty string in case the project is valid, the reason otherwise.
   */
  public string getInvalidReason()
  {
    if (this.getId().isEmpty())
      return tr("The project ID is empty.\n$1").subst(this.toString("\t"));

    if (this.getInstallDir().isEmpty())
      return tr("The project install directory is empty.\n$1").subst(this.toString("\t"));

    if (((string)this.getName()).isEmpty())
      return tr("The project name is empty.\n$1").subst(this.toString("\t"));

    return "";
  }

  //---------------------------------------------------------------------------
  /** Set the project directory
  */
  public void setDir(const string &path)
  {
    this.setInstallDir(dirName(path));

    const string id = baseName(path);

    if (this.setId(id))
      return; // coco validated: defensive (mPokorny)

    if (this.setName(id))
      return; // coco validated: defensive (mPokorny)
  }

  //------------------------------------------------------------------------------
  /** @brief Function checks if the project is registered.
   * @details Function does not check if the project physically exists.
   * @return Returns TRUE when project is registered, otherwise FALSE.
   */
  public bool isRegistered()
  {
    if (this.getId().isEmpty())
      this._errorHandler.exception(this.getInvalidReason());

    // TODO. check within pmon if the project is registered
    return findProjectRegistryById(this.getId()) != undefined;
  }

  //------------------------------------------------------------------------------
  /** Function register sub-project.
   * @synchronized Function is not thread safe.
   * @return Returns 0 when project is registered successfully, otherwise -1.
   */
  public int registerProj()
  {
    // set the name in case the user forgot it
    if (((string)this.getName()).isEmpty())
      this.setName(this.getId());

    if (!this.isValid())
      this._errorHandler.exception(this.getInvalidReason());

    // TODO use PmonComponent to register project here

    return 0;
  }

  //------------------------------------------------------------------------------
  /** Function un-register project.
   * The project will be un-registered only. The projects files remain unchanged.
   * @synchronized Function is not thread safe.
   * @return Returns 0 when project is un-registered successfully, otherwise -1.
   */
  public int unregisterProj()
  {
    if (this.getId().isEmpty())
      this._errorHandler.exception(this.getInvalidReason());

    
    // TODO use PmonComponent to de-register project here

    return 0;
  }

  //------------------------------------------------------------------------------
  /** @brief Function checks if the project physically exists.
   * @details Does not check if is registered.
   * @return Returns TRUE when project is exists, otherwise FALSE.
   */
  public bool exists()
  {
    string path = this.getDir();
    return (!path.isEmpty()) && isdir(path);
  }


  //------------------------------------------------------------------------------
  /** @brief Function convert this object to string variable.
   * @details This is helper for debugging in std log.
   * @param prefix Prefix for each new line.
   * @return Object formatted in string variable.
   */
  public string toString(const string prefix = "")
  {
    string ret;

    ret =  prefix + tr("Project ID: $1\n").subst(this.getId());
    ret += prefix + tr("Name: $1\n").subst(this.getName());
    ret += prefix + tr("Install directory: $1\n").subst(this.getInstallDir());
    ret += prefix + tr("Version: $1").subst(this.getVersion());
    return ret;
  }


  //------------------------------------------------------------------------------
  /** @brief Function removes (physical) and un-register the project.
   *
   * @synchronized Function is not thread safe.
   * @return Error code. Returns 0 when successful. Otherwise -1.
   * @warning Work only with locale host.
   */
  public synchronized int deleteProj()
  {
    const string id = getId();
    DebugFTN("ProjEnvProject", __FUNCTION__, id, getStackTrace());

    
    // TODO use PmonComponent to delete project here

    return 0;
  }

  //------------------------------------------------------------------------------
  /**
   * @brief Starts the project and waits for completion
   * @param timeOut Seconds to wait for project startup (0 = don't wait)
   * @return Error code:
   *         0  = Success
   *         -1 = Start failed
   *         -2 = Before-start hook failed
   *         -3 = After-start hook failed
   *         -4 = Wait timeout
   *         -5 = After-started hook failed
   */
  public int start(int timeOut = 0)
  {
    
    // TODO use PmonComponent to delete project here
    return 0;
  }


  //------------------------------------------------------------------------------
  /** @brief Function stops the Project.
   * @param timeOut for stopping the project.
   * @details But the pmon are still on living after them. Stop only all project managers.
   *         With default parameter the function does not wait till project stopped.
             When the function is called with parameter >= 0 it waits the amount in seconds till the Project has the State Down
   *
   * @return Error code. Returns 0 when successful. Otherwise -1.
   */
  public int stop(const float timeOut = 0)
  {
    
    // TODO use PmonComponent to stop project here
  }

  //------------------------------------------------------------------------------
  /** @brief Function restarts the project.
   * @param timeOut for starting the project.
   * @details Start the project via pmon interface.
   *         Function start also pmon self, when is not running.
   *         The function does wait till project is restarted.
   *         When the function is called with *timeOut* > 0 it waits the amount in seconds till the Project has the State Monitoring again.
   *
   * @return  Error code.
   * value | description
   * ------|------------
   * 0     | Success.
   * -1    | Pmon does not accept start command. Ex. NW-problem.
   * -2    | Could not restart project within timeOut.
   * -3    | Project could not be stopped within timeOut
   */
  public int restart(const int timeOut = 0)
  {

    
    // TODO use PmonComponent to restart project here
  }

  //------------------------------------------------------------------------------
  /** @brief Function kills manager at the given idx.
   * @details Index begin with 1. Pmon has idx 0 in progs file.
   *
   * @param manIdx Manager index in the pmon table.
   * @return Error code. Returns 0 when successful. Otherwise -1.
   */
  public int killManager(int manIdx)
  {
    
    // TODO use PmonComponent to kill manager here
  }

  //------------------------------------------------------------------------------
  /** @brief Function start pmon for this project.
   *  @details Pmon can be started locally only.
   * @param autoStart Enable to start project self by pmon. You can deactivate it,
   *                 so is started pmon only.
   * @return Error code.
   * value | description
   * ------|------------
   * 0     | Success.
   * -1    | Cannot start pmon. See log file for more information.
   * -2    | Cannot connect to pmon.
   */
  public int startPmon(const bool autoStart = TRUE)
  {
    
    // TODO use PmonComponent to start pmon here
  }

  //------------------------------------------------------------------------------
  /**
   * @brief Function stop the Pmon.
   * @return Returns 0 when successful, otherwise -1.
   */
  public int stopPmon(bool stopWait = TRUE)
  {
    
    // TODO use PmonComponent to stop project && pmon here
  }


  //------------------------------------------------------------------------------
  /** @brief Function checks if pmon is running.
   * @details Checks only pmon, does not check if the pmon is running for this project.
   *         It can be used to general check, if the pmon with given host, port is
   *         running. Be sure that you have nw-connection to the remote pmon-host.
   * @return Returns TRUE when pmon is running on the host, otherwise FALSE.
   */
  public bool isPmonRunning()
  {
    
    // TODO use PmonComponent to stop project && pmon here
    // probably we need to add the method isRunning() : boolen { ... }
    // with command WCCILpmon.exe -proj Bla -log +stderr -command PROJECT:
    // which will return exception and std-err 'failed to connect: Connection refused (10061)'
    // in good case the std-err (or std-out I am not sure) contains the project names self. Ex:
    // `Bla
    //
    // `
  }

  //------------------------------------------------------------------------------
  /** @brief Function checks if is the pmon running.
   * @return Returns TRUE when pmon with 'this' project is running on the host, otherwise FALSE.
   */
  public bool isRunning()
  {
    
    // TODO use PmonComponent to get the project running state here
  }

  //------------------------------------------------------------------------------
  /** Returns current project status.
      @details The function returns the project status. The status is stored in the pmon table.
      @return Project status.
      @see ProjEnvProjectState.
  */
  public ProjEnvProjectState getStatus()
  {
    // TODO use PmonComponent to get the project state here
  }

  //------------------------------------------------------------------------------
  /// @todo mPokorny 11.09.2018: return some enum or constants
  public int getEmergencyStatus()
  {
    // TODO use PmonComponent to get the project  emergencystate here
  }

  //------------------------------------------------------------------------------
  /// @todo mPokorny 11.09.2018: return some enum or constants
  public int getDemoStatus()
  {
    // TODO use PmonComponent to get the project demo state here
  }


  //------------------------------------------------------------------------------
  /** @brief  Function activates a debug flag
   * @details Sends the "activate debug flag(s)" command during running time
   * @param   manIdx Manager index in the pmon table.
   * @param   dbgFlags debug parameter e.g.: -dbg 2 or -report ALL
   * @return  Returns 0 when flag was set, otherwise returns -1 or -2.
   */
  public int sendDbgFlag(int manIdx, const string &dbgFlags)
  {
    
    // TODO use PmonComponent to send debug flag here

    /** TODO wait until the manager has accpeted the flag.
     * Normally it takes few ms, but it might take a while, when manager is blocked now.
    while (!timeOut.hasExpired())
    {
      if (getPath(LOG_REL_PATH, "dbg", "", 1).isEmpty())
        break;

      delay(0, 10);
    }
      */

    return 0;
  }


  //------------------------------------------------------------------------------
  /** @brief Returns the index of the 1st manager matching the given criteria.
   *
   * @param component Either a component name (e.g. "WCCOActrl") or a component constant (e.g. CTRL_COMPONENT)
   * @param options Command line options that shall be PART of the manager's command line options, or a string PATTERN they shall match
   * @return PMON index of the 1st manager matching the given criteria, or -1.
   */
  public int getManagerIndex(const anytype &component, string options = "")
  {
    dyn_anytype managersData = getListOfManagerOptions();
    int managersDataCount = dynlen(managersData);

    string componentName = getComponentName(component);

    for (int i = 1; i <= managersDataCount; i++)
    {
      if ((managersData[i].component == componentName) &&
          ((strpos(managersData[i].startOptions, options) >= 0) || patternMatch(options, managersData[i].startOptions)))
      {
        return i - 1; // manager indexing is 0-based
      }
    }

    return -1;
  }

  //------------------------------------------------------------------------------
  /** @brief Function starts manager at the given idx.
   * @details Index begin with 1. Pmon has idx 0 in progs file.
   *
   * @param manIdx Manager index in the pmon table.
   * @param timeOut Time to wait for expected manager state.
   * @param state Expected manager state.
   * @return Error code. Returns 0 when . Otherwise -1.
   */
  public int startManager(int manIdx, const int timeOut = 0, const ProjEnvManagerState state = ProjEnvManagerState::Running)
  {
    if (manIdx <= 0)
    {
      this._errorHandler.severe(tr("Invalid argument in function $1(). The manager index ($2) must be greater than 0!").subst(__FUNCTION__, manIdx));
      return -1;
    }

    
    // TODO use PmonComponent to start manager here

    return 0;
  }

  //------------------------------------------------------------------------------
  /** @brief Function stopped manager at the given idx.
   * @details Index begin with 1. Pmon has idx 0 in progs file.
   *
   * @param manIdx Manager index in the pmon table.
   * @param timeOut Time to wait for expected manager state.
   * @param state Expected manager state.
   * @return Error code. Returns 0 when successful. Otherwise -1.
   */
  public int stopManager(int manIdx, const int timeOut = 0, const ProjEnvManagerState state = ProjEnvManagerState::NotRunning)
  {
    if (manIdx <= 0)
    {
      this._errorHandler.severe(tr("Invalid argument in function $1(). The manager index ($2) must be greater than 0!").subst(__FUNCTION__, manIdx));
      return -1;
    }

    
    // TODO use PmonComponent to stop manager here

    return 0;
  }

  //------------------------------------------------------------------------------
  /** @brief Function deletes manager at the given idx.
   * @param manIdx Manager index in the pmon table.
   *               Index begin with 1. Pmon has idx 0 in progs file.
   * @return Error code. Returns 0 when successful. Otherwise -1.
   */
  public int deleteManager(int manIdx)
  {
    if (manIdx <= 0)
    {
      this._errorHandler.severe(tr("Invalid argument in function $1(). The manager index ($2) must be greater than 0!").subst(__FUNCTION__, manIdx));
      return -1;
    }

    
    // TODO use PmonComponent to delete manager here
  }

  //------------------------------------------------------------------------------
  /** @brief Function inserts manager at the given idx.
   * @details Index begin with 1. Pmon has index 0 in progs file.
   * @param opts Manager options.
   * @param manIdx Manager index in the pmon table.
   *               Index begin with 1. Pmon has idx 0 in progs file.
   * @return Error code. Returns -1 when failed, -2 when pmon is not reachable, otherwise returns the index of the inserted manager.
   */
  public int insertManager(const ProjEnvManagerOptions &opts, int manIdx = -1)
  {
    if (opts.component.isEmpty())
      return -1;

    
    // TODO use PmonComponent to insert manager here
  }

  //------------------------------------------------------------------------------
  /** @brief Function changes manager options at the given index.
   * @details Index begin with 1. Pmon has index 0 in progs file.
   * @param manIdx Manager index in the pmon table.
   *               Index begin with 1. Pmon has index 0 in progs file.
   * @param opts Manager options.
   * @return Error code. Returns 0 when successful. Otherwise -1.
   */
  public int changeManagerOptions(const int &manIdx, const ProjEnvManagerOptions &opts)
  {
    if (manIdx <= 0)
    {
      this._errorHandler.severe(tr("Invalid argument in function $1(). The manager index ($2) must be greater than 0!").subst(__FUNCTION__, manIdx));
      return -1;
    }

    // TODO use PmonComponent setManagerOptionsAt() here

    return 0;
  }

  //------------------------------------------------------------------------------
  /** @brief Function changes manager start mode at the given index.
   * @details Index begin with 1. Pmon has index 0 in progs file.
   * @param manIdx Manager index in the pmon table.
   *               Index begin with 1. Pmon has index 0 in progs file.
   * @param startMode Start mode of the manager.
   * @return Error code. Returns 0 when successful. Otherwise -1.
   */
  public int changeManagerStartMode(const int &manIdx, const ProjEnvManagerStartMode &startMode)
  {
    ProjEnvManagerOptions current = this.getManagerOptions(manIdx);
    current.startMode = startMode;
    return this.changeManagerOptions(manIdx, current);
  }

  //------------------------------------------------------------------------------
  /** @brief Function changes manager start options at the given index.
   * @details Index begin with 1. Pmon has index 0 in progs file.
   * @param manIdx Manager index in the pmon table.
   *               Index begin with 1. Pmon has index 0 in progs file.
   * @param startOptions Start options of the manager.
   * @return Error code. Returns 0 when successful. Otherwise -1.
   */
  public int changeManagerStartOptions(const int &manIdx, const string &startOptions)
  {
    ProjEnvManagerOptions current = this.getManagerOptions(manIdx);
    current.startOptions = startOptions;
    return this.changeManagerOptions(manIdx, current);
  }

  //------------------------------------------------------------------------------
  /** @brief Function returns manager options at the given index.
   * @details Index begin with 1. Pmon has index 0 in progs file.
   * @param idx Manager index in the pmon table.
   * @return Manager options. Returns NULL when failed.
   */
  public ProjEnvManagerOptions getManagerOptions(int idx)
  {
    if (idx < 0)
      return NULL;

    // TODO use PmonComponent getManagerOptionsAt() here
  }

  //------------------------------------------------------------------------------
  /** @brief Function returns list of all manager options.
   * @details The function returns the list of all manager options.
   *          The list is stored in the pmon table.
   * @return List of ProjEnvManagerOptions. In case of error is empty dyn_anytype.
   */
  public dyn_anytype getListOfManagerOptions()
  {
    
    // TODO use PmonComponent getManagerOptionsList() here
  }

  public getProjectStatus() : ProjEnvPmonProjectStatus {
    
    // TODO use PmonComponent getProjectStatus() here
  }

  //------------------------------------------------------------------------------
  /**
   * @brief Function returns manager info as mapping.
   * @param idx Manager index in the pmon table.
   *            Index begin with 1. Pmon has idx 0 in progs file.
   * @return Manager information ProjEnvManagerInfo. In case of error returns empty ProjEnvManagerInfo.
   */
  public ProjEnvManagerInfo getManagerInfo(int idx)
  {
    return getProjectStatus()?.managers.at(idx);
  }

  //------------------------------------------------------------------------------
  /**
   * @brief Function returns manager state ProjEnvManagerState.
   * @param idx Manager index in the pmon table.
   *            Index begin with 1. Pmon has idx 0 in progs file.
   * @return Manager state. See also ProjEnvManagerState.
   */
  public ProjEnvManagerState getManagerStatus(const int &idx)
  {
    return getProjectStatus()?.managers.at(idx)?.state;
  }

  //------------------------------------------------------------------------------
  /** @brief Function insert value to project config file.
   * @param value Value to insert into the config file
   * @param key Config key under which to insert the value
   * @param section Config section name (defaults to "general")
   * @param configFile Name of config file (defaults to "config")
   * @return Error code:
   *         0  = Success
   *         -1 = Failed to insert value
   */
  public int insertCfgValue(const anytype &value, const string &key, string section = "general", string configFile = "config")
  {
    ProjEnvProjectConfig cfg = ProjEnvProjectConfig(getConfigPath(configFile));

    if (cfg.insertValue(value, key, section))
      return -1;
    else
      return 0;
  }

  //------------------------------------------------------------------------------
  /** @brief Function set value to project config file.
   * @param value Value to set in the config file
   * @param key Config key to set
   * @param section Config section name (defaults to "general")
   * @param configFile Name of config file (defaults to "config")
   * @return Error code:
   *          0 = Success
   *         -1 = Failed to set value
   */
  public int setCfgValue(const anytype &value, const string &key, string section = "general", string configFile = "config")
  {
    ProjEnvProjectConfig cfg = ProjEnvProjectConfig(getConfigPath(configFile));

    if (cfg.setValue(value, key, section))
      return -1;
    else
      return 0;
  }

  //------------------------------------------------------------------------------
  /** @brief Function deletes value in project config file.
   * @param value Value to delete from config
   * @param key Config key to delete
   * @param section Config section name (defaults to "general")
   * @param configFile Name of config file (defaults to "config")
   * @return Error code:
   *          0 = Success
   *         -1 = Failed to delete value
   */
  public int deleteCfgValue(const anytype &value, const string &key, string section = "general", string configFile = "config")
  {
    ProjEnvProjectConfig cfg = ProjEnvProjectConfig(getConfigPath(configFile));

    if (cfg.deleteValue(value, key, section))
      return -1;
    else
      return 0;
  }

  //------------------------------------------------------------------------------
  /** @brief Function deletes entry in config file, used when only the key is known - but not the value. Deletes only one entry, from top to bottom
   * @param key Config key.
   * @param section Config section.
   * @param configFile Config file.
   * @return Error code. Returns 0 when successful. Otherwise -1.
   */
  public int deleteCfgEntry(const string &key, string section = "general", string configFile = "config")
  {
    ProjEnvProjectConfig cfg = ProjEnvProjectConfig(getConfigPath(configFile));

    if (cfg.deleteEntry(key, section))
      return -1;
    else
      return 0;
  }


  //------------------------------------------------------------------------------
  /** Returns ID formatted for logs.
    * It includes few more information, like host name, which makes the log analysis
    * for parallel (multiple nodes) executions more easy.
  */
  public string getIdInLogFormat()
  {
    string logId = this.getId();

    return logId;
  }


  //---------------------------------------------------------------------------
  /** Returns default project location (directory).
   * @details The default project location is the last used project directory.
   *          If the last used project directory is not set, the default location is:
   *          - Windows: C:\WinCC_OA_Proj\
   *          - Linux: /opt/WinCC_OA_Proj/
   * @return Default project location (directory).
  */
  public string getDefaultInstallDir()
  {
    // TODO use getLastUsedProjectDir() from ProjEnvProjectRegistry here
    string defaultDirectory = paGetLastUsedProjDir();

    if (!defaultDirectory.isEmpty())
      return defaultDirectory;

    if (_WIN32)
      return "C:\\WinCC_OA_Proj\\";
    else if (_UNIX)
      return "/opt/WinCC_OA_Proj/";
    else
      return ""; // android, mac, mobile UI, ITC ?
  }

//--------------------------------------------------------------------------------
//@protected members
//--------------------------------------------------------------------------------



  //------------------------------------------------------------------------------
  // general project options
  /// Project version. It muss be WinCC OA version number
  protected string _version;
  /// Project ID. Means directory name, within is the project crated.
  protected string _id;
  /// Project name. Human readable name.
  protected string _name;
  // The full native path to project install directory.
  protected string _path;

  /// Pmon object to controll pmon self.
  protected PmonComponent _pmon;

  /// Languages
  protected _languages : (OaLanguage)[];

  // Is proj runnable or not.
  protected _runnable : ProjEnvProjectRunnable = ProjEnvProjectRunnable.Unknown;

  protected ProjEnvErrorHandler _errorHandler;

//--------------------------------------------------------------------------------
//@private members
//--------------------------------------------------------------------------------

}