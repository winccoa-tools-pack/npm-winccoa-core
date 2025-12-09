

export interface ProjEnvProjectConfig
{
//--------------------------------------------------------------------------------
//@public members
//--------------------------------------------------------------------------------
  public bool throwErrors = true;

  //------------------------------------------------------------------------------
  /**
   * @brief Default c-tor
   *
   * @return initialized object of class ProjEnvProjectConfig
   */
  public ProjEnvProjectConfig(const string configFilePath = "")
  {
    setConfigPath(configFilePath);
  }

  //------------------------------------------------------------------------------
  /** @brief Function return full native path to the config file.
    @exception Empty string.
    @return Full native path to the config file.
  */
  public string getConfigPath()
  {
    return _configFilePath;
  }

  //------------------------------------------------------------------------------
  /** @brief Set config path.
    @details This function does not create some config. only set the member to this class.
    @param configFilePath Full path to config file.
  */
  public setConfigPath(const string &configFilePath)
  {
    _configFilePath = makeNativePath(configFilePath);
  }

  //------------------------------------------------------------------------------
  /** @brief Function insert value to config file.
   * @param value Value to be inserted.
   * @param key Key.
   * @param section Section.
   * @return Error code. Returns 0 when successful. Otherwise -1.
   */
  public int insertValue(const anytype &value, const string &key, const string section = "general")
  {
    const string cfgPath = getConfigPath();

    if (cfgPath == "")
      return -1;

    int err = paCfgInsertValue(cfgPath, section, key, value);
    dyn_errClass lastErr = getLastError();

    if (err < 0)
    {
      if (throwErrors)
      {
        throwError(lastErr);
        errClass err = makeError("pa", PRIO_WARNING, ERR_SYSTEM, 17, __FUNCTION__,
                                 key + "=" + value, cfgPath);
        throwError(err);
      }

      return -1;
    }

    return 0;
  }

  //------------------------------------------------------------------------------
  /** @brief Function set value in config file.
   * @param value Value to be set.
   * @param key Key.
   * @param section Section.
   * @return Error code. Returns 0 when successful. Otherwise -1.
   */
  public int setValue(const anytype &value, const string &key, const string section = "general")
  {
    const string cfgPath = getConfigPath();

    if (cfgPath == "")
      return -1;

    int err = paCfgSetValue(cfgPath, section, key, value);
    dyn_errClass lastErr = getLastError();

    if (err < 0)
    {
      if (throwErrors)
      {
        throwError(lastErr);
        errClass err = makeError("pa", PRIO_WARNING, ERR_SYSTEM, 17, __FUNCTION__,
                                 key + "=" + value, cfgPath);
        throwError(err);
      }

      return -1;
    }

    return 0;
  }

  //------------------------------------------------------------------------------
  /** @brief Function deletes value in config file - contrary to setValue()
   * @param value Value to be deleted.
   * @param key Key.
   * @param section Section.
   * @return Error code. Returns 0 when successful. Otherwise -1.
   */
  public int deleteValue(const anytype &value, const string &key, const string section = "general")
  {
    const string cfgPath = getConfigPath();

    if (cfgPath == "")
      return -1;

    int err = paCfgDeleteValue(cfgPath, section, key, value);
    dyn_errClass lastErr = getLastError();

    if (err < 0)
    {
      if (throwErrors)
      {
        throwError(lastErr);
        errClass err = makeError("pa", PRIO_WARNING, ERR_SYSTEM, 17, __FUNCTION__,
                                 key + "=" + value, cfgPath);
        throwError(err);
      }

      return -1;
    }

    return 0;
  }

  //------------------------------------------------------------------------------
  /** @brief Function deletes entry in config file, used when only the key is known - but not the value. Deletes only one entry, from top to bottom
   * @param key Key.
   * @param section Section.
   * @return Error code. Returns 0 when successful. Otherwise -1.
   */
  public int deleteEntry(const string &key, const string section = "general")
  {
    const string cfgPath = getConfigPath();

    if (cfgPath == "")
      return -1;

    int err = paCfgDeleteValue(cfgPath, section, key);
    dyn_errClass lastErr = getLastError();

    if (err < 0)
    {
      if (throwErrors)
      {
        throwError(lastErr);
        errClass err = makeError("pa", PRIO_WARNING, ERR_SYSTEM, 17, __FUNCTION__,
                                 key, cfgPath);
        throwError(err);
      }

      return -1;
    }

    return 0;
  }

//--------------------------------------------------------------------------------
//@protected members
//--------------------------------------------------------------------------------
  protected string _configFilePath;


//--------------------------------------------------------------------------------
//@private members
//--------------------------------------------------------------------------------
}