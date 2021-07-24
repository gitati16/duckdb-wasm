set(BOOST_VERSION_REQUIRED 1.74.0)
set(BOOST_RELEASE_DIR boost_1_74_0)

message(STATUS "BOOST_VERSION_REQUIRED=${BOOST_VERSION_REQUIRED}")

set(BOOST_INSTALL_DIR "${CMAKE_BINARY_DIR}/third_party/boost/install")
set(BOOST_INCLUDE_DIR "${BOOST_INSTALL_DIR}/include")

if(DEFINED BOOST_ARCHIVE)
  set(BOOST_LIBRARY_DIR "${BOOST_INSTALL_DIR}/lib")
  set(BOOST_ARCHIVE_DIR "${CMAKE_BINARY_DIR}/third_party/boost/archive")

  if(EXISTS ${BOOST_INCLUDE_DIR}/boost/version.hpp)
    file(STRINGS ${BOOST_INCLUDE_DIR}/boost/version.hpp BOOST_VERSIONSTR
         REGEX "#define[ ]+BOOST_VERSION[ ]+[0-9]+")
    string(REGEX MATCH "[0-9]+" BOOST_VERSIONSTR ${BOOST_VERSIONSTR})
    if(BOOST_VERSIONSTR)
      math(EXPR BOOST_VERSION_MAJOR "${BOOST_VERSIONSTR} / 100000")
      math(EXPR BOOST_VERSION_MINOR "${BOOST_VERSIONSTR} / 100 % 1000")
      math(EXPR BOOST_VERSION_SUBMINOR "${BOOST_VERSIONSTR} % 100")
      set(BOOST_VERSION
          "${BOOST_VERSION_MAJOR}.${BOOST_VERSION_MINOR}.${BOOST_VERSION_SUBMINOR}"
      )
    endif()
    message(STATUS "BOOST_VERSION=${BOOST_VERSION}")
  endif()

  if(BOOST_VERSION STREQUAL BOOST_VERSION_REQUIRED)
    message(STATUS "Boost version OK!")
  else()
    message(STATUS "BOOST_ARCHIVE=${BOOST_ARCHIVE}")
    message(STATUS "BOOST_INCLUDE_DIR=${BOOST_INCLUDE_DIR}")
    file(REMOVE ${BOOST_ARCHIVE_DIR})
    file(REMOVE ${BOOST_INCLUDE_DIR})
    file(MAKE_DIRECTORY ${BOOST_ARCHIVE_DIR})
    file(MAKE_DIRECTORY ${BOOST_INCLUDE_DIR})

    execute_process(
      COMMAND tar -xvz --strip-components=1 -f ${BOOST_ARCHIVE}
              ${BOOST_RELEASE_DIR}/boost WORKING_DIRECTORY ${BOOST_INCLUDE_DIR})
  endif()
else()
  if(NOT EXISTS ${BOOST_INCLUDE_DIR}/boost/version.hpp)
    file(REMOVE ${BOOST_INCLUDE_DIR})
    file(MAKE_DIRECTORY ${BOOST_INCLUDE_DIR})
    find_package(Boost ${BOOST_VERSION_REQUIRED} REQUIRED)
    file(COPY ${Boost_INCLUDE_DIR}/boost DESTINATION ${BOOST_INCLUDE_DIR}/boost)
    message(STATUS "BOOST_INCLUDE_DIR=${BOOST_INCLUDE_DIR}")
  endif ()
endif()
