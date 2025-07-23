#!/usr/bin/env bash
set -o pipefail

# E-mail sending reference
# https://www.systutorials.com/sending-email-from-mailx-command-in-linux-using-gmails-smtp/

cmdLine="$0 $@"
# E-mail parameters
mailTo="CHANGEME"
mailFrm="CHANGEME"
mailNam="Npm Checker"
mailSbj="Npm Check"
mailPwd="CHANGEME"

VERSION="0.3"
startTime=$(date +%s)
ncuFlag=0
ncuFilterFlag=0
ncuRejectFlag=0
quietFlag=0
errFlag=0

OLDIFS=$IFS
IFS=$'\n'

runDir="$PWD"
npmDir="${runDir}/npmCheck"
repoDir="${npmDir}/repo"
npmLogDir="${npmDir}/logs"
npmLog="${npmLogDir}/npmCheck.log"
npmOut="${npmLogDir}/npmCheck.out"
npmDebugDir="${HOME}/.npm/_logs"
npmDebugTar="${npmLogDir}/npmDebugLogs.tar.gz"
errDirs="${npmLogDir}/errDirs.txt"
okDirs="${npmLogDir}/okDirs.txt"
errDirsNcu="${npmLogDir}/errDirsNcu.txt"
okDirsNcu="${npmLogDir}/okDirsNcu.txt"
errMsg="${npmLogDir}/err.msg"
ignoreDirs="${runDir}/ignore.txt"
npmFiles="${npmDir}/file_list.txt"

npmCnt=0

unset currentPath
unset repoURL

mkLog(){
 if [ ${quietFlag} -eq 1 ];then
  echo "[$(date +%d-%m-%Y-%H:%M:%S)] $@" >> "${npmLog}"
 else
  echo "[$(date +%d-%m-%Y-%H:%M:%S)] $@" | tee -a "${npmLog}"
 fi
}

checkErr(){
 errFlag=1
 mkLog "[ERROR] in ${currentPath}:"
 cat ${errMsg} | tee -a ${npmLog}

 if [ X${1} == "Xgit" ];then
  cat ${errMsg} >> ${npmOut}
 fi

 # add dir to error list if set
 if ! [ -z ${currentPath+x} ]
  then
     if [ X${1} == "Xncu" ];then
      echo ${currentPath} >> ${errDirsNcu}
     else
      echo ${currentPath} >> ${errDirs}
    fi
 fi

 return 254
}

# Initialize directories
initDirs(){
 rm -rf "${npmDir}"
 mkdir -p "${npmLogDir}" "${repoDir}"
 > "${errDirs}"
 > "${okDirs}"
 
 # Clean up any existing .next directories before starting
 mkLog "[cleanup] Removing existing .next directories"
 find "${runDir}" -type d -name ".next" -exec rm -rf {} + 2>/dev/null || true
}

sendMail(){
 if [ ${errFlag} -ne 0 ];then
  s-nail -s "$mailSbj [ERROR] $repoName" \
  -S smtp-use-starttls \
  -S ssl-verify=ignore \
  -S smtp-auth=login \
  -S smtp=smtp://smtp.gmail.com:587 \
  -S from="$mailFrm ($mailNam)" \
  -S smtp-auth-user=$mailFrm \
  -S smtp-auth-password=$mailPwd \
  -S ssl-verify=ignore \
  -a $npmLog \
  -a $npmDebugTar \
  $mailTo < $npmOut || checkErr
 else
  s-nail -s "$mailSbj [OK] $repoName" \
  -S smtp-use-starttls \
  -S ssl-verify=ignore \
  -S smtp-auth=login \
  -S smtp=smtp://smtp.gmail.com:587 \
  -S from="$mailFrm ($mailNam)" \
  -S smtp-auth-user=$mailFrm \
  -S smtp-auth-password=$mailPwd \
  -S ssl-verify=ignore \
  $mailTo < $npmOut || checkErr
 fi
}

cloneRepo(){
 repoURL=$1
 rm -rf "${repoDir}"
 mkLog "[git] cloning repository $1"
 git clone "$1" "${repoDir}" 2> ${errMsg} || checkErr git
}

createDirList(){
 searchDir=$1
 mkLog "[find] package.json files in ${searchDir}"
 if [ -f $ignoreDirs ]; then
  mkLog "[ignore.txt] file found..."
  find ${searchDir} -name 'package.json' | grep -v node_modules | grep -v '\.next' | grep -v -f $ignoreDirs | sort > $npmFiles
 else
  find ${searchDir} -name 'package.json' | grep -v node_modules | grep -v '\.next' | sort > $npmFiles
 fi

 totalFiles=$(wc -l $npmFiles|awk '{print $1}')
}

npmBuild(){
 while read i;do
  currentPath=$(dirname $i)
  currentDir=$(basename ${currentPath})
  npmCnt=$(($npmCnt+1))
  
  # Skip if directory doesn't exist
  if [ ! -d "${currentPath}" ]; then
   mkLog "[npm] Skipping $npmCnt of $totalFiles ${currentDir} - directory not found"
   continue
  fi
  
  # Skip if package.json doesn't exist
  if [ ! -f "${i}" ]; then
   mkLog "[npm] Skipping $npmCnt of $totalFiles ${currentDir} - package.json not found"
   continue
  fi
  
  mkLog "[npm] Processing $npmCnt of $totalFiles ${currentDir}"
  pushd "${currentPath}" > /dev/null
  mkLog "[npm] install"
  {
   npm install 2> ${errMsg} >> ${npmLog} || checkErr
  } && \
  {
   mkLog "[npm] run build" && \
   npm run build 2> ${errMsg} >> ${npmLog} || checkErr && \
   echo "${currentPath}" >> ${okDirs}
  } && \
  {
   if [ ${ncuFlag} -eq 1 ];then
    tryNcu
   fi
  }
  rm -rf ./node_modules ./.next
  popd > /dev/null
done < $npmFiles
}

tryNcu(){
 unset ncuArgs

 if [ ${ncuFilterFlag} -eq 1 ];then
  ncuArgs="--filter ${ncuFilterArg}"
 fi

 if [ ${ncuRejectFlag} -eq 1 ];then
  ncuArgs="${ncuArgs} --reject ${ncuRejectArg}"
 fi

  if ! [ -z ${ncuArgs+x} ];then
   ncuCMD="ncu --upgrade --packageFile ./package.json ${ncuArgs}"
  else
   ncuCMD="ncu --upgrade --packageFile ./package.json"
  fi

 {
  mkLog "[ncu] upgrade: ${ncuCMD}"
  eval "${ncuCMD}" 2> ${errMsg} >> ${npmLog}|| checkErr ncu
 } && \
 {
  mkLog "[ncu] npm install" && \
  rm -rf ./node_modules && \
  npm install 2> ${errMsg} >> ${npmLog}|| checkErr ncu
 } && \
 {
  mkLog "[ncu] npm run build" && \
  npm run build 2> ${errMsg} >> ${npmLog}|| checkErr ncu
 } && echo "${currentPath}" >> ${okDirsNcu}
}

finalCleanup(){
 mkLog "[cleanup] Final cleanup - removing all .next and node_modules directories"
 
 # Read through all directories we processed and clean them up
 if [ -f "$npmFiles" ]; then
  while read i; do
   dirPath=$(dirname $i)
   if [ -d "${dirPath}" ]; then
    mkLog "[cleanup] Cleaning ${dirPath}"
    rm -rf "${dirPath}/.next" 2>/dev/null || true
    rm -rf "${dirPath}/node_modules" 2>/dev/null || true
   fi
  done < $npmFiles
 fi
 
 # Determine the search directory
 local searchDir="${runDir}"
 if ! [ -z ${repoURL+x} ] && [ -d "${repoDir}" ]; then
  searchDir="${repoDir}"
 fi
 
 # Do a comprehensive cleanup in the search directory
 mkLog "[cleanup] Running comprehensive cleanup in ${searchDir}"
 find "${searchDir}" -type d -name ".next" -exec rm -rf {} + 2>/dev/null || true
 find "${searchDir}" -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
 
 mkLog "[cleanup] Final cleanup completed"
}

writeReport()
{
 repoName=$(echo $repoURL|awk -F/ '{print $5}')
 failBuilds=$(wc -l $errDirs|awk '{print $1}')
 succBuilds=$(wc -l $okDirs|awk '{print $1}')

 if [ ${ncuFlag} -eq 1 ];then
  failBuildsNcu=$(wc -l ${errDirsNcu}|awk '{print $1}')
  succBuildsNcu=$(wc -l ${okDirsNcu}|awk '{print $1}')
 else
  failBuildsNcu=0
  succBuildsNcu=0.
 fi

 finishTime=$(date +%s)

 case "$(uname -a)" in
   Linux*)  totalTime=$(date -u -d@$(($finishTime-$startTime)) +"%T")
            ;;
   Darwin*) totalTime=$(date -u -r $(($finishTime-$startTime)) +"%T")
            ;;
 esac

tarNpmLogs(){
 rm -f ${npmDebugTar}
 tar cvfz ${npmDebugTar} ${npmDebugDir} 2> ${npmLog}
}

 if [ ${failBuilds} -ne 0 ] || [ ${failBuildsNcu} -ne 0 ];then
  tarNpmLogs
 fi

 echo ""
 echo "## -- Execution Report -- ##"
 echo -e "Hostname:\t$HOSTNAME"
 echo -e "Script execution date:\t"$(date)
 echo -e "Total execution time:\t$totalTime\n"

 echo -e "cmdline is:\t${cmdLine}"
 echo ""
 echo -e "Failures:\t${failBuilds} of ${totalFiles}"

 if [ ${failBuilds} -gt 0 ];then
  echo -e "\nFailed builds:"
  cat -n "${errDirs}"
  echo
 fi

 if [ ${ncuFlag} -eq 1 ];then
  echo -e "Failures [ncu]:\t${failBuildsNcu} of ${totalFiles}"
  if [ ${failBuildsNcu} -gt 0 ];then
   echo -e "\nFailed builds [ncu]:"
   cat -n "${errDirsNcu}"
   echo
  fi
 fi

 echo -e "Success:       \t${succBuilds} of ${totalFiles}"

 if [ ${ncuFlag} -eq 1 ];then
  echo -e "Success [ncu]:\t${succBuildsNcu} of ${totalFiles}\n"
 fi

 if [ -f $ignoreDirs ]; then
  echo ""
  echo "${ignoreDirs} file found with following content:"
  cat ${ignoreDirs}
 fi
 
 echo ""
 echo "Note: All .next and node_modules directories have been removed from processed folders."

  # Send e-mail if running on Linux"
  case "$(uname -a)" in
   Linux*) sendMail >> ${npmLog}
           ;;
  esac
}

# Check if script is run with a parameter
main(){
 # Initialize directories
 initDirs

 # check if repoURL is set and check if it is a file
 if ! [ -z ${repoURL+x} ];then
 mkLog "repoURL is ${repoURL}"
  if [ -f ${repoURL} ];then
   mkLog "${repoURL} is a file, reading URLS"
   while read u;do
    $0 -r "${u}"
   done < <(egrep -v '(^$|^#)' ${repoURL})
   exit 0
  else
   mkLog "${repoURL} is an URL"
   cloneRepo "${repoURL}"
   createDirList ${repoDir}
   npmBuild || mkLog "[npmBuild] Error: Please check logs in $npmLogDir"
   if [ ${quietFlag} -eq 1 ];then
    writeReport >> ${npmOut}
   else
    writeReport | tee -a ${npmOut}
   fi
  fi
 else
  # if repoURL is not set, search for local files
  mkLog "Searching ${runDir} for local files"
  createDirList ${runDir}
  npmBuild || mkLog "[npmBuild] Error: Please check logs in $npmLogDir"
  if [ ${quietFlag} -eq 1 ];then
   writeReport >> ${npmOut}
  else
   writeReport | tee -a ${npmOut}
  fi
 fi
 
 # Always perform final cleanup
 finalCleanup
}

showHelp(){
 echo
 echo "npm build checker script v $VERSION"
 echo "Usage: $0 [-h] [-r <URL>|<FILE>] [-u] [-q]"
 echo
 echo "-h               Display this help"
 echo "-r <URL>|<FILE>  Download git repository from URL or from a FILE containing URLs"
 echo "-u               Run 'ncu -u' after a successful build"
 echo "-q               Quiet mode, useful when running from CRON"
 echo "-f <matches>     [ncu] Include only package names matching the given string, comma-or-space-delimited list, or /regex/"
 echo "-x <matches>     [ncu] Exclude packages matching the given string, comma-or-space-delimited list, or /regex/"
 echo
}

while getopts ":uhqr:f:x:" opt;do
 case $opt in
   r) repoURL="${OPTARG}"
      ;;
   q) quietFlag=1
      ;;
   u) ncuFlag=1
      > "${errDirsNcu}"
      > "${okDirsNcu}"
      ;;
   f) ncuFilterFlag=1
      ncuFilterArg="${OPTARG}"
      ;;
   x) ncuRejectFlag=1
      ncuRejectArg="${OPTARG}"
      ;;
   *) showHelp
      exit
      ;;
 esac
done

main

IFS=$OLDIFS
