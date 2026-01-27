#!/bin/bash

# Docker sends SIGTERM as default, trap also SIGINT if script is started manually
trap stop SIGTERM SIGINT

codeMeterPid=-1
pmonPid=-1

start()
{
  # if there is a compressed project defined and a config file does
  # not exist in the project dir, extract it to the project dir
  if [ -n "$OAPROJEXTRACT" ]; then
    if [ ! -f "$OAPROJ/config/config" ]; then
      echo "Config file not found, extracting $OAPROJEXTRACT to $OAPROJ"
      mkdir -p $OAPROJ

      # Detect if it is a tar or zip file
      case $OAPROJEXTRACT in
        *.tar*) tar xvf $OAPROJEXTRACT --directory $OAPROJ/ ;;
        *.zip) unzip $OAPROJEXTRACT -d $OAPROJ/ ;;
        *) echo "$OAPROJEXTRACT: Unrecognized file extension." ;;
      esac

    else
      echo "Config file found, no need to extract $OAPROJEXTRACT"
    fi
  fi

  # if there is a sleep time defined, wait before starting processes
  if [ -n "$OASLEEP" ]; then
    echo "Waiting $OASLEEP seconds before starting the project"
    sleep $OASLEEP
  fi

  # start CodeMeter in the background
  sudo /usr/sbin/CodeMeterLin
  sleep 1
  codeMeterPid=`pidof CodeMeterLin`

  if [ -n "$LICENSESERVER" ]; then
    echo "set CodeMeter licenseserver list to $LICENSESERVER"

    # need to wait some seconds as CodeMeter service is not yet ready
    sleep 2
    for cmls in $(IFS=',';echo $LICENSESERVER); do
      cmu --add-server $cmls
    done
    cmu --list-server
  fi
  
  # start the PMON in the background, $OAPROJ is set to a default in the Dockerfile
  # "-log +stdout" enables error handler output to stdout (docker logs) AND PVSS_II.log
  # to disable usage of PVSS_II.log add "-log -file" to the pmon command below
  $OAINST/bin/WCCILpmon -config $OAPROJ/config/config -log +stdout -autofreg &
  pmonPid=$!

  echo "WCCILpmon running as PID $pmonPid, CodeMeter running as PID $codeMeterPid"
  
  # wait for PMON to stop
  wait $pmonPid
  # wait returns directly after receiving the signal, so wait until pmon is really stopped
  while ps -p $pmonPid > /dev/null; do sleep 1; done

  # graceful exit of CodeMeter so the license gets returned to the license-server
  echo "Shutting down CodeMeter (PID: $codeMeterPid)"
  sudo kill -SIGTERM $codeMeterPid
  while ps -p $codeMeterPid > /dev/null; do sleep 1; done

  echo "WCCILpmon and CodeMeter ended, all processes stopped!"
}

stop()
{
  # forward SIGTERM or SIGINT to the PMON as SIGTERM
  kill -SIGTERM $pmonPid
}

start
